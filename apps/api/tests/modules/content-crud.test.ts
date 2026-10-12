// End-to-end CRUD coverage for units, lessons and screens over the real HTTP
// surface: createApp().handle(request) → routes → Zod validation → auth/rbac
// → services → drizzle. Only the SQL execution layer is replaced by the
// in-memory fake (tests/helpers/fake-content-db.ts); Better Auth sessions are
// stubbed by cookie. No Postgres, no S3, no sockets.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  makeFakeContentDb,
  registerCascade,
  resetFakeDb,
  seedFakeTable,
} from "../helpers/fake-content-db.ts";

const db = makeFakeContentDb();

mock.module("../../src/database/index.ts", () => ({ getDb: () => db }));

mock.module("../../src/auth/index.ts", () => ({
  auth: {
    api: {
      getSession: async ({ headers }: { headers: Headers }) => {
        const match = /session_token=([^;\s]+)/.exec(headers.get("cookie") ?? "");
        if (!match) return null;
        const isAdmin = match[1] === "admin";
        const id = isAdmin ? "admin-1" : "user-1";
        return {
          user: {
            id,
            name: isAdmin ? "Admin" : "User",
            email: `${id}@test.dev`,
            emailVerified: true,
            image: null,
            role: isAdmin ? "admin" : "user",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
          session: {
            id: `sess-${id}`,
            userId: id,
            token: "tok",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            ipAddress: "",
            userAgent: "",
          },
        };
      },
    },
    // Mounted by createApp() at /api/auth/* — content tests never hit it.
    handler: async () => new Response("mock auth", { status: 404 }),
  },
}));

const { createApp } = await import("../../src/app.ts");
const { setStorageFake } = await import("../../src/libs/storage.ts");
const { user } = await import("../../src/database/auth-schema.ts");
const { contentUnits, contentLessons, contentScreens } =
  await import("../../src/database/schema.ts");

// Mirror the real ON DELETE CASCADE foreign keys the services lean on.
registerCascade(contentUnits, contentLessons, "unitId");
registerCascade(contentLessons, contentScreens, "lessonId");

const app = createApp();
const ADMIN = "session_token=admin";
const USER = "session_token=user";

type Envelope = {
  ok: boolean;
  data?: object;
  error?: { code: string; message: string };
};

/** Narrow a list/create response payload without repeating casts per call. */
function dataOf<T>(body: Envelope): T | undefined {
  return body.data as T | undefined;
}

function request(path: string, init: RequestInit = {}, cookie?: string): Request {
  const headers = new Headers(init.headers);
  if (cookie) headers.set("cookie", cookie);
  return new Request(`http://localhost${path}`, { ...init, headers });
}

async function call(
  path: string,
  init: RequestInit = {},
  cookie?: string,
): Promise<{ status: number; body: Envelope }> {
  const res = await app.handle(request(path, init, cookie));
  const raw = await res.text();
  // Framework 401s answer plain text; service responses are JSON envelopes.
  let body: Envelope = { ok: false, error: { code: "PLAIN", message: raw } };
  if (raw.startsWith("{")) body = JSON.parse(raw) as Envelope;
  return { status: res.status, body };
}

function send(
  method: string,
  path: string,
  data?: unknown,
  cookie?: string,
): Promise<{ status: number; body: Envelope }> {
  return call(
    path,
    {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data ?? {}),
    },
    cookie,
  );
}

const get = (path: string, cookie?: string) => call(path, {}, cookie);
const post = (path: string, data: unknown, cookie?: string) => send("POST", path, data, cookie);
const patch = (path: string, data: unknown, cookie?: string) => send("PATCH", path, data, cookie);
const put = (path: string, data: unknown, cookie?: string) => send("PUT", path, data, cookie);
const del = (path: string, cookie?: string) => send("DELETE", path, undefined, cookie);

async function createUnit(title: string, cookie = ADMIN): Promise<string> {
  const { body } = await post("/v1/content/units", { title }, cookie);
  return String(dataOf<{ id: string }>(body)?.id);
}

async function createLesson(unitId: string, title: string, cookie = ADMIN): Promise<string> {
  const { body } = await post("/v1/content/lessons", { unitId, title }, cookie);
  return String(dataOf<{ id: string }>(body)?.id);
}

async function createScreen(
  lessonId: string,
  type: string,
  extra: Record<string, unknown> = {},
  cookie = ADMIN,
): Promise<string> {
  const { body } = await post("/v1/content/screens", { lessonId, type, ...extra }, cookie);
  return String(dataOf<{ id: string }>(body)?.id);
}

beforeAll(() => {
  // Hermetic storage: deleteOldImage on imageUrl changes must not touch S3.
  setStorageFake({ put: async () => "", delete: async () => {}, read: async () => null });
});

beforeEach(() => {
  resetFakeDb();
  seedFakeTable(user, [
    { id: "admin-1", role: "admin" },
    { id: "user-1", role: "user" },
  ]);
});

afterAll(() => {
  setStorageFake(null);
});

// ── Auth & RBAC ──────────────────────────────────────────────────────────────

describe("content auth & rbac", () => {
  it("rejects admin writes without a session (401)", async () => {
    const { status } = await post("/v1/content/units", { title: "X" });
    expect(status).toBe(401);
  });

  it("rejects non-admin sessions on writes (403 FORBIDDEN envelope)", async () => {
    const { status, body } = await post("/v1/content/units", { title: "X" }, USER);
    expect(status).toBe(403);
    expect(body).toEqual({
      ok: false,
      error: { code: "FORBIDDEN", message: "Forbidden" },
    });
  });

  it("keeps public reads open without a session", async () => {
    const { status, body } = await get("/v1/content/units");
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true, data: [] });
  });

  it("guards admin reads (lessons and screens listings) with 401", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");

    const lessons = await get(`/v1/content/units/${unitId}/lessons`);
    expect(lessons.status).toBe(401);

    const screens = await get(`/v1/content/lessons/${lessonId}/screens`);
    expect(screens.status).toBe(401);

    const lessonsOk = await get(`/v1/content/units/${unitId}/lessons`, ADMIN);
    expect(lessonsOk.status).toBe(200);
  });
});

// ── Units ────────────────────────────────────────────────────────────────────

describe("unit CRUD", () => {
  it("creates a minimal unit with derived slug, sortOrder and timestamps", async () => {
    const { status, body } = await post("/v1/content/units", { title: "Keuangan" }, ADMIN);

    expect(status).toBe(200);
    expect(body.ok).toBe(true);
    const unit = dataOf<Record<string, unknown>>(body);
    expect(unit).toMatchObject({
      title: "Keuangan",
      slug: "keuangan",
      description: null,
      imageUrl: null,
      sortOrder: 0,
    });
    expect(typeof unit?.id).toBe("string");
    expect(typeof unit?.createdAt).toBe("string");
    expect(typeof unit?.updatedAt).toBe("string");
  });

  it("creates a fully-populated unit and normalizes a custom slug", async () => {
    const { body } = await post(
      "/v1/content/units",
      {
        title: "Investasi",
        description: "Pelajari instrumen investasi.",
        slug: "My Custom Slug!",
        imageUrl: "https://cdn.test/content/investasi.png",
      },
      ADMIN,
    );

    expect(body.data).toMatchObject({
      title: "Investasi",
      description: "Pelajari instrumen investasi.",
      slug: "my-custom-slug",
      imageUrl: "https://cdn.test/content/investasi.png",
    });
  });

  it("auto-increments sortOrder for each new unit", async () => {
    await createUnit("Satu");
    const second = await post("/v1/content/units", { title: "Dua" }, ADMIN);
    expect(dataOf<{ sortOrder: number }>(second.body)?.sortOrder).toBe(1);
  });

  it("lists units ordered by sortOrder", async () => {
    await createUnit("Satu");
    await createUnit("Dua");
    await createUnit("Tiga");

    const { body } = await get("/v1/content/units");
    const titles = (body.data as { title: string }[]).map((u) => u.title);
    expect(titles).toEqual(["Satu", "Dua", "Tiga"]);
  });

  it("rejects a duplicate title case-insensitively (409)", async () => {
    await createUnit("Keuangan");
    const { status, body } = await post("/v1/content/units", { title: "  keuangan " }, ADMIN);

    expect(status).toBe(409);
    expect(body.error).toEqual({
      code: "CONFLICT",
      message: "Judul unit sudah dipakai.",
    });
  });

  it("validates create inputs (422 on bad bodies)", async () => {
    const cases: unknown[] = [
      {}, // title missing
      { title: "   " }, // blank after trim
      { title: "Ok", description: "x".repeat(501) }, // description too long
      { title: "Ok", imageUrl: "not-a-url" },
      { title: "Ok", sortOrder: -1 },
    ];
    for (const payload of cases) {
      const { status } = await post("/v1/content/units", payload, ADMIN);
      expect(status).toBe(422);
    }
  });

  it("fetches a unit by id; unknown id yields data null", async () => {
    const id = await createUnit("Keuangan");

    const found = await get(`/v1/content/units/${id}`);
    expect(found.status).toBe(200);
    expect(dataOf<{ id: string }>(found.body)?.id).toBe(id);

    const missing = await get("/v1/content/units/nope");
    expect(missing.status).toBe(200);
    expect(missing.body.data).toBeNull();
  });

  it("updates title, description and image; slug follows the new title", async () => {
    const id = await createUnit("Keuangan");
    const { status, body } = await patch(
      `/v1/content/units/${id}`,
      { title: "Keuangan Pribadi", description: "Revisi deskripsi", imageUrl: null },
      ADMIN,
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      id,
      title: "Keuangan Pribadi",
      slug: "keuangan-pribadi",
      description: "Revisi deskripsi",
      imageUrl: null,
    });
  });

  it("updates imageUrl to null and keeps the storage write best-effort", async () => {
    const id = await createUnit("Keuangan");
    await patch(`/v1/content/units/${id}`, { imageUrl: "https://cdn.test/content/x.png" }, ADMIN);
    const { body } = await patch(`/v1/content/units/${id}`, { imageUrl: null }, ADMIN);
    expect(dataOf<{ imageUrl: string | null }>(body)?.imageUrl).toBeNull();
  });

  it("rejects an unknown unit update with 404 NOT_FOUND", async () => {
    const { status, body } = await patch("/v1/content/units/nope", { title: "X" }, ADMIN);
    expect(status).toBe(404);
    expect(body.error?.code).toBe("NOT_FOUND");
  });

  it("rejects a title already used by another unit (409)", async () => {
    await createUnit("Satu");
    const otherId = await createUnit("Dua");
    const { status, body } = await patch(`/v1/content/units/${otherId}`, { title: "Satu" }, ADMIN);

    expect(status).toBe(409);
    expect(body.error?.message).toBe("Judul unit sudah dipakai.");
  });

  it("validates update inputs (422 on bad bodies)", async () => {
    const id = await createUnit("Keuangan");
    const cases: unknown[] = [
      { title: "   " },
      { description: "x".repeat(501) },
      { sortOrder: -1 },
    ];
    for (const payload of cases) {
      const { status } = await patch(`/v1/content/units/${id}`, payload, ADMIN);
      expect(status).toBe(422);
    }
  });

  it("reorders units and persists sortOrder through the list", async () => {
    const a = await createUnit("Satu");
    const b = await createUnit("Dua");
    const c = await createUnit("Tiga");

    const { status } = await put("/v1/content/units/reorder", { ids: [c, a, b] }, ADMIN);
    expect(status).toBe(200);

    const { body } = await get("/v1/content/units");
    const rows = body.data as { id: string; sortOrder: number }[];
    expect(rows.map((r) => r.id)).toEqual([c, a, b]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1, 2]);
  });

  it("deletes a unit (200) and removes it from the listing", async () => {
    const id = await createUnit("Keuangan");
    const { status } = await del(`/v1/content/units/${id}`, ADMIN);
    expect(status).toBe(200);

    const { body } = await get("/v1/content/units");
    expect(body.data).toEqual([]);
  });
});

// ── Lessons ──────────────────────────────────────────────────────────────────

describe("lesson CRUD", () => {
  it("creates a lesson with all fields and a derived slug", async () => {
    const unitId = await createUnit("Keuangan");
    const { status, body } = await post(
      "/v1/content/lessons",
      {
        unitId,
        title: "Mulai Menabung",
        description: "Kenapa menabung penting.",
        icon: "piggy",
        prerequisiteIds: [],
      },
      ADMIN,
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      unitId,
      title: "Mulai Menabung",
      slug: "mulai-menabung",
      description: "Kenapa menabung penting.",
      icon: "piggy",
      prerequisiteIds: [],
      sortOrder: 0,
    });
  });

  it("scopes title uniqueness to the unit", async () => {
    const u1 = await createUnit("Satu");
    const u2 = await createUnit("Dua");
    await createLesson(u1, "Pengantar");

    const otherUnit = await post("/v1/content/lessons", { unitId: u2, title: "Pengantar" }, ADMIN);
    expect(otherUnit.status).toBe(200);

    const dup = await post("/v1/content/lessons", { unitId: u1, title: "  pengantar " }, ADMIN);
    expect(dup.status).toBe(409);
    expect(dup.body.error).toEqual({
      code: "CONFLICT",
      message: "Judul lesson sudah dipakai di unit ini.",
    });
  });

  it("auto-increments sortOrder within the unit", async () => {
    const unitId = await createUnit("Keuangan");
    await createLesson(unitId, "Satu");
    const second = await post("/v1/content/lessons", { unitId, title: "Dua" }, ADMIN);
    expect(dataOf<{ sortOrder: number }>(second.body)?.sortOrder).toBe(1);
  });

  it("validates create inputs (422 on bad bodies)", async () => {
    const unitId = await createUnit("Keuangan");
    const cases: unknown[] = [
      { title: "Tanpa unit" },
      { unitId, title: "   " },
      { unitId, title: "X".repeat(201) },
      { unitId, title: "X", description: "x".repeat(501) },
      { unitId, title: "X", icon: "i".repeat(51) },
      { unitId, title: "X", prerequisiteIds: "bukan-array" },
      { unitId, title: "X", sortOrder: -1 },
      { unitId: "", title: "X" },
    ];
    for (const payload of cases) {
      const { status } = await post("/v1/content/lessons", payload, ADMIN);
      expect(status).toBe(422);
    }
  });

  it("lists admin lessons per unit and joins unit info in lessons-all", async () => {
    const unitId = await createUnit("Keuangan");
    await createLesson(unitId, "Satu");
    await createLesson(unitId, "Dua");

    const list = await get(`/v1/content/units/${unitId}/lessons`, ADMIN);
    expect((list.body.data as { title: string }[]).map((l) => l.title)).toEqual(["Satu", "Dua"]);

    const all = await get("/v1/content/lessons-all");
    const rows = all.body.data as { unitTitle: string; unitSlug: string }[];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ unitTitle: "Keuangan", unitSlug: "keuangan" });
  });

  it("returns a lesson with its screens, plus the full variant with unit info", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    await createScreen(lessonId, "concept", {
      prompt: "Apa itu dana darurat?",
      explain: "Cadangan.",
    });

    const one = await get(`/v1/content/lessons/${lessonId}`);
    expect(one.body.data).toMatchObject({ id: lessonId });
    expect((one.body.data as { screens: unknown[] }).screens).toHaveLength(1);

    const full = await get(`/v1/content/lessons/${lessonId}/full`);
    expect(full.body.data).toMatchObject({
      id: lessonId,
      unitTitle: "Keuangan",
      unitSlug: "keuangan",
    });
    expect((full.body.data as { screens: unknown[] }).screens).toHaveLength(1);

    const missing = await get("/v1/content/lessons/nope");
    expect(missing.body.data).toBeNull();
  });

  it("updates title, description, icon and image; slug follows the title", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");

    const { status, body } = await patch(
      `/v1/content/lessons/${lessonId}`,
      {
        title: "Menabung Rutin",
        description: "Deskripsi baru.",
        icon: "cash",
        imageUrl: null,
      },
      ADMIN,
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      id: lessonId,
      title: "Menabung Rutin",
      slug: "menabung-rutin",
      description: "Deskripsi baru.",
      icon: "cash",
      imageUrl: null,
    });
  });

  it("stores, replaces and clears prerequisite ids", async () => {
    const unitId = await createUnit("Keuangan");
    const a = await createLesson(unitId, "Pengantar");
    const b = await createLesson(unitId, "Lanjutan");

    const stored = await patch(`/v1/content/lessons/${b}`, { prerequisiteIds: [a] }, ADMIN);
    expect(dataOf<{ prerequisiteIds: string[] | null }>(stored.body)?.prerequisiteIds).toEqual([a]);

    const cleared = await patch(`/v1/content/lessons/${b}`, { prerequisiteIds: null }, ADMIN);
    expect(dataOf<{ prerequisiteIds: string[] | null }>(cleared.body)?.prerequisiteIds).toBeNull();
  });

  it("rejects prerequisite cycles and self-reference with 409", async () => {
    const unitId = await createUnit("Keuangan");
    const a = await createLesson(unitId, "A");
    const b = await createLesson(unitId, "B");

    await patch(`/v1/content/lessons/${b}`, { prerequisiteIds: [a] }, ADMIN);

    const cycle = await patch(`/v1/content/lessons/${a}`, { prerequisiteIds: [b] }, ADMIN);
    expect(cycle.status).toBe(409);
    expect(cycle.body.error).toEqual({
      code: "CONFLICT",
      message: "Prasyarat tidak boleh berputar. Pilihan tersebut sudah bergantung pada lesson ini.",
    });

    const self = await patch(`/v1/content/lessons/${a}`, { prerequisiteIds: [a] }, ADMIN);
    expect(self.status).toBe(409);
  });

  it("validates update inputs (422) and unknown ids (404)", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");

    for (const payload of [
      { title: "   " },
      { description: "x".repeat(501) },
      { icon: "i".repeat(51) },
      { sortOrder: -1 },
    ]) {
      const { status } = await patch(`/v1/content/lessons/${lessonId}`, payload, ADMIN);
      expect(status).toBe(422);
    }

    const missing = await patch("/v1/content/lessons/nope", { title: "X" }, ADMIN);
    expect(missing.status).toBe(404);
    expect(missing.body.error?.code).toBe("NOT_FOUND");
  });

  it("reorders lessons and persists sortOrder", async () => {
    const unitId = await createUnit("Keuangan");
    const a = await createLesson(unitId, "Satu");
    const b = await createLesson(unitId, "Dua");
    const c = await createLesson(unitId, "Tiga");

    const { status } = await put("/v1/content/lessons/reorder", { ids: [c, b, a] }, ADMIN);
    expect(status).toBe(200);

    const list = await get(`/v1/content/units/${unitId}/lessons`, ADMIN);
    const rows = list.body.data as { id: string; sortOrder: number }[];
    expect(rows.map((r) => r.id)).toEqual([c, b, a]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1, 2]);
  });

  it("applies reorder positions and silently ignores unknown ids", async () => {
    const unitId = await createUnit("Keuangan");
    const a = await createLesson(unitId, "Satu");
    const b = await createLesson(unitId, "Dua");
    const c = await createLesson(unitId, "Tiga");

    const { status } = await put("/v1/content/lessons/reorder", { ids: [c, b, a] }, ADMIN);
    expect(status).toBe(200);

    const list = await get(`/v1/content/units/${unitId}/lessons`, ADMIN);
    const rows = list.body.data as { id: string; sortOrder: number }[];
    expect(rows.map((r) => r.id)).toEqual([c, b, a]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1, 2]);

    // Unknown ids are no-ops: known ids still take their positions.
    const withUnknown = await put("/v1/content/lessons/reorder", { ids: [b, "nope", a, c] }, ADMIN);
    expect(withUnknown.status).toBe(200);
    const after = await get(`/v1/content/units/${unitId}/lessons`, ADMIN);
    expect((after.body.data as { id: string }[]).map((r) => r.id)).toEqual([b, a, c]);
  });

  it("deletes a lesson (200) and removes it from the listing", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");

    const { status } = await del(`/v1/content/lessons/${lessonId}`, ADMIN);
    expect(status).toBe(200);

    const all = await get("/v1/content/lessons-all");
    expect(all.body.data).toEqual([]);
  });
});

// ── Screens ──────────────────────────────────────────────────────────────────

describe("screen CRUD", () => {
  it("creates a concept screen with prompt, explain and derived slug", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const { status, body } = await post(
      "/v1/content/screens",
      {
        lessonId,
        type: "concept",
        prompt: "Apa itu dana darurat?",
        explain: "Cadangan 3-6 biaya.",
      },
      ADMIN,
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      lessonId,
      type: "concept",
      prompt: "Apa itu dana darurat?",
      slug: "apa-itu-dana-darurat",
      explain: "Cadangan 3-6 biaya.",
      sortOrder: 0,
    });
  });

  it("creates a choice screen with options and correct answer", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const options = [
      { id: "opt1", label: "20%" },
      { id: "opt2", label: "5%" },
    ];
    const { body } = await post(
      "/v1/content/screens",
      { lessonId, type: "choice", prompt: "Berapa minimal tabungan?", options, correctId: "opt1" },
      ADMIN,
    );

    expect(body.data).toMatchObject({
      type: "choice",
      options,
      correctId: "opt1",
      sortOrder: 0,
    });
  });

  it("creates a numeric screen with unit and accepted range", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const { body } = await post(
      "/v1/content/screens",
      {
        lessonId,
        type: "numeric",
        prompt: "10% dari 500.000?",
        numericUnit: "Rp",
        acceptRangeMin: 45000,
        acceptRangeMax: 55000,
      },
      ADMIN,
    );

    expect(body.data).toMatchObject({
      type: "numeric",
      numericUnit: "Rp",
      acceptRangeMin: 45000,
      acceptRangeMax: 55000,
    });
  });

  it("creates an allocation screen with categories and rule", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const rule = { type: "min", categoryId: "Tabungan", min: 20, max: 50 } as const;
    const { body } = await post(
      "/v1/content/screens",
      {
        lessonId,
        type: "allocation",
        prompt: "Alokasikan gaji",
        categories: ["Kebutuhan", "Tabungan"],
        rule,
      },
      ADMIN,
    );

    expect(body.data).toMatchObject({
      type: "allocation",
      categories: ["Kebutuhan", "Tabungan"],
      rule,
    });
  });

  it("allows repeated blank prompts but rejects duplicate non-empty prompts (409)", async () => {
    const unitId = await createUnit("Keuangan");
    const otherUnit = await createUnit("Dua");
    const lessonId = await createLesson(unitId, "Menabung");
    const otherLesson = await createLesson(otherUnit, "Lain");

    const blank1 = await post("/v1/content/screens", { lessonId, type: "concept" }, ADMIN);
    const blank2 = await post(
      "/v1/content/screens",
      { lessonId, type: "concept", prompt: "" },
      ADMIN,
    );
    expect(blank1.status).toBe(200);
    expect(blank2.status).toBe(200);

    const first = await post(
      "/v1/content/screens",
      { lessonId, type: "concept", prompt: "Soal Ganda", explain: "E" },
      ADMIN,
    );
    expect(first.status).toBe(200);

    const dup = await post(
      "/v1/content/screens",
      { lessonId, type: "concept", prompt: "  soal ganda ", explain: "E" },
      ADMIN,
    );
    expect(dup.status).toBe(409);
    expect(dup.body.error).toEqual({
      code: "CONFLICT",
      message: "Pertanyaan ini sudah dipakai di lesson ini.",
    });

    const otherLessonPrompt = await post(
      "/v1/content/screens",
      { lessonId: otherLesson, type: "concept", prompt: "Soal Ganda", explain: "E" },
      ADMIN,
    );
    expect(otherLessonPrompt.status).toBe(200);
  });

  it("validates create inputs (422 on bad bodies)", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");

    const cases: unknown[] = [
      { type: "concept" }, // lessonId missing
      { lessonId, type: "bogus" },
      { lessonId, type: "concept", prompt: "x".repeat(5001) },
      { lessonId, type: "numeric", acceptRangeMin: "abc" },
      { lessonId, type: "allocation", rule: { type: "percentage", categoryId: "x", min: 1 } },
      { lessonId, type: "concept", sortOrder: -1 },
      { lessonId, type: "choice", options: ["bukan-objek"] },
      { lessonId, type: "concept", prompt: 42 },
    ];
    for (const payload of cases) {
      const { status } = await post("/v1/content/screens", payload, ADMIN);
      expect(status).toBe(422);
    }
  });

  it("lists screens per lesson (admin, ordered) and exposes screens-all with joins", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    await createScreen(lessonId, "concept", { prompt: "Pertama", explain: "E" });
    await createScreen(lessonId, "concept", { prompt: "Kedua", explain: "E" });
    await createScreen(lessonId, "concept", { prompt: "Ketiga", explain: "E" });

    const list = await get(`/v1/content/lessons/${lessonId}/screens`, ADMIN);
    const rows = list.body.data as { prompt: string; sortOrder: number }[];
    expect(rows.map((r) => r.prompt)).toEqual(["Pertama", "Kedua", "Ketiga"]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1, 2]);

    const all = await get("/v1/content/screens-all");
    const joined = all.body.data as Record<string, unknown>[];
    expect(joined).toHaveLength(3);
    expect(joined[0]).toMatchObject({
      lessonTitle: "Menabung",
      lessonSlug: "menabung",
      unitSlug: "keuangan",
      unitId,
    });
  });

  it("updates prompt/explain and re-derives the slug", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const id = await createScreen(lessonId, "concept", { prompt: "Lama", explain: "E" });

    const { status, body } = await patch(
      `/v1/content/screens/${id}`,
      { prompt: "Simpan 30 Persen", explain: "Penjelasan baru." },
      ADMIN,
    );

    expect(status).toBe(200);
    expect(body.data).toMatchObject({
      prompt: "Simpan 30 Persen",
      slug: "simpan-30-persen",
      explain: "Penjelasan baru.",
    });
  });

  it("updates choice options and correct answer", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const id = await createScreen(lessonId, "choice", {
      prompt: "Pilih",
      options: [
        { id: "opt1", label: "A" },
        { id: "opt2", label: "B" },
      ],
      correctId: "opt1",
    });

    const options = [
      { id: "opt1", label: "A" },
      { id: "opt2", label: "B" },
      { id: "opt3", label: "C" },
    ];
    const { body } = await patch(
      `/v1/content/screens/${id}`,
      { options, correctId: "opt3" },
      ADMIN,
    );
    expect(body.data).toMatchObject({ options, correctId: "opt3" });
  });

  it("updates numeric range and unit", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const id = await createScreen(lessonId, "numeric", {
      prompt: "Angka",
      numericUnit: "Rp",
      acceptRangeMin: 0,
      acceptRangeMax: 100,
    });

    const { body } = await patch(
      `/v1/content/screens/${id}`,
      { numericUnit: "%", acceptRangeMin: 10, acceptRangeMax: 50 },
      ADMIN,
    );
    expect(body.data).toMatchObject({ numericUnit: "%", acceptRangeMin: 10, acceptRangeMax: 50 });
  });

  it("updates allocation categories and rule", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const id = await createScreen(lessonId, "allocation", {
      prompt: "Alokasi",
      categories: ["Kebutuhan", "Tabungan"],
      rule: { type: "min", categoryId: "Tabungan", min: 20 },
    });

    const rule = { type: "min", categoryId: "Tabungan", min: 10, max: 30 } as const;
    const { body } = await patch(
      `/v1/content/screens/${id}`,
      { categories: ["Tabungan", "Hiburan"], rule },
      ADMIN,
    );
    expect(body.data).toMatchObject({ categories: ["Tabungan", "Hiburan"], rule });
  });

  it("rejects duplicate prompts on update (409), blank prompts (422) and unknown ids (404)", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const a = await createScreen(lessonId, "concept", { prompt: "Soal", explain: "E" });
    const b = await createScreen(lessonId, "concept", { prompt: "Lain", explain: "E" });

    const dup = await patch(`/v1/content/screens/${b}`, { prompt: "soal" }, ADMIN);
    expect(dup.status).toBe(409);

    const blank = await patch(`/v1/content/screens/${b}`, { prompt: "   " }, ADMIN);
    expect(blank.status).toBe(422);

    const missing = await patch("/v1/content/screens/nope", { prompt: "X" }, ADMIN);
    expect(missing.status).toBe(404);
    expect(missing.body.error?.code).toBe("NOT_FOUND");
    expect(a).toBeTruthy();
  });

  it("reorders screens within a lesson and persists sortOrder", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const a = await createScreen(lessonId, "concept", { prompt: "Pertama", explain: "E" });
    const b = await createScreen(lessonId, "concept", { prompt: "Kedua", explain: "E" });

    const { status } = await put("/v1/content/screens/reorder", { ids: [b, a] }, ADMIN);
    expect(status).toBe(200);

    const list = await get(`/v1/content/lessons/${lessonId}/screens`, ADMIN);
    const rows = list.body.data as { id: string; sortOrder: number }[];
    expect(rows.map((r) => r.id)).toEqual([b, a]);
    expect(rows.map((r) => r.sortOrder)).toEqual([0, 1]);
  });

  it("deletes a screen (200) and removes it from listings", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const id = await createScreen(lessonId, "concept", { prompt: "Hapus", explain: "E" });

    const { status } = await del(`/v1/content/screens/${id}`, ADMIN);
    expect(status).toBe(200);

    const all = await get("/v1/content/screens-all");
    expect(all.body.data).toEqual([]);
  });
});

// ── Cascades ─────────────────────────────────────────────────────────────────

describe("delete cascades", () => {
  it("unit delete removes its lessons/screens and scrubs cross-unit prerequisites", async () => {
    const u1 = await createUnit("Satu");
    const u2 = await createUnit("Dua");
    const doomed = await createLesson(u1, "Hapus Saya");
    await createLesson(u1, "Juga Hapus");
    const survivor = await createLesson(u2, "Selamat");
    await createScreen(doomed, "concept", { prompt: "Terhapus", explain: "E" });
    await patch(`/v1/content/lessons/${survivor}`, { prerequisiteIds: [doomed] }, ADMIN);

    const { status } = await del(`/v1/content/units/${u1}`, ADMIN);
    expect(status).toBe(200);

    const lessons = await get("/v1/content/lessons-all");
    const rows = lessons.body.data as { id: string; prerequisiteIds: string[] | null }[];
    expect(rows.map((r) => r.id)).toEqual([survivor]);
    expect(rows[0].prerequisiteIds).toBeNull();

    const screens = await get("/v1/content/screens-all");
    expect(screens.body.data).toEqual([]);

    const units = await get("/v1/content/units");
    expect((units.body.data as { id: string }[]).map((u) => u.id)).toEqual([u2]);
  });

  it("lesson delete removes its screens and scrubs prerequisites", async () => {
    const unitId = await createUnit("Keuangan");
    const doomed = await createLesson(unitId, "Hapus");
    const survivor = await createLesson(unitId, "Selamat");
    await createScreen(doomed, "concept", { prompt: "Soal", explain: "E" });
    await patch(`/v1/content/lessons/${survivor}`, { prerequisiteIds: [doomed] }, ADMIN);

    const { status } = await del(`/v1/content/lessons/${doomed}`, ADMIN);
    expect(status).toBe(200);

    const lessons = await get("/v1/content/lessons-all");
    const rows = lessons.body.data as { id: string; prerequisiteIds: string[] | null }[];
    expect(rows.map((r) => r.id)).toEqual([survivor]);
    expect(rows[0].prerequisiteIds).toBeNull();

    const screens = await get("/v1/content/screens-all");
    expect(screens.body.data).toEqual([]);
  });
});

// ── Full lifecycle ───────────────────────────────────────────────────────────

describe("full content lifecycle", () => {
  it("runs unit → lesson → all four screen types → aggregate reads → reorder → delete", async () => {
    const unitId = await createUnit("Keuangan");
    const lessonId = await createLesson(unitId, "Menabung");
    const concept = await createScreen(lessonId, "concept", { prompt: "Konsep", explain: "E1" });
    const choice = await createScreen(lessonId, "choice", {
      prompt: "Pilih",
      explain: "E2",
      options: [
        { id: "opt1", label: "A" },
        { id: "opt2", label: "B" },
      ],
      correctId: "opt1",
    });
    const numeric = await createScreen(lessonId, "numeric", {
      prompt: "Angka",
      explain: "E3",
      numericUnit: "Rp",
      acceptRangeMin: 0,
      acceptRangeMax: 100,
    });
    const allocation = await createScreen(lessonId, "allocation", {
      prompt: "Alokasi",
      explain: "E4",
      categories: ["Tabungan"],
      rule: { type: "min", categoryId: "Tabungan", min: 20 },
    });

    const agg = await get("/v1/content/units-with-content");
    const units = agg.body.data as { lessons: { screens: { type: string }[] }[] }[];
    expect(units).toHaveLength(1);
    expect(units[0].lessons).toHaveLength(1);
    expect(units[0].lessons[0].screens.map((s) => s.type)).toEqual([
      "concept",
      "choice",
      "numeric",
      "allocation",
    ]);

    await put(
      "/v1/content/screens/reorder",
      { ids: [allocation, numeric, choice, concept] },
      ADMIN,
    );
    const list = await get(`/v1/content/lessons/${lessonId}/screens`, ADMIN);
    expect((list.body.data as { id: string }[]).map((s) => s.id)).toEqual([
      allocation,
      numeric,
      choice,
      concept,
    ]);

    await patch(`/v1/content/lessons/${lessonId}`, { title: "Menabung Rutin" }, ADMIN);
    const afterEdit = await get("/v1/content/lessons-all");
    expect((afterEdit.body.data as { title: string }[])[0].title).toBe("Menabung Rutin");

    await del(`/v1/content/lessons/${lessonId}`, ADMIN);
    expect((await get("/v1/content/screens-all")).body.data).toEqual([]);
    const aggAfterLesson = await get("/v1/content/units-with-content");
    expect((aggAfterLesson.body.data as { lessons: unknown[] }[])[0].lessons).toEqual([]);

    await del(`/v1/content/units/${unitId}`, ADMIN);
    expect((await get("/v1/content/units")).body.data).toEqual([]);
    expect((await get("/v1/content/lessons-all")).body.data).toEqual([]);
  });
});
