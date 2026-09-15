// Contract suite for the HTTP surface: drives the real createApp() through
// app.handle() so no socket is opened. Runs in CI without any infrastructure.
//
//   bun run --cwd apps/api test                       # contract + unit tests
//   TEST_DATABASE_URL=postgres://.../verselab_test bun run --cwd apps/api test
//
// Setting TEST_DATABASE_URL additionally runs the authenticated end-to-end
// group: it migrates that database and truncates its tables on teardown, so it
// must point at a disposable database, never the dev one.
import { afterAll, beforeAll, describe, expect, it } from "bun:test";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Point the lazy getDb() at the disposable test database. This must happen
// before any module import so src/config/env.ts parses the test URL.
if (TEST_DATABASE_URL) {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
}

const { createApp } = await import("../../src/app.ts");

const app = createApp();
const webOrigin = "http://localhost:3000";

function request(path: string, init?: RequestInit, cookie = ""): Request {
  const headers = new Headers(init?.headers);
  headers.set("origin", webOrigin);
  if (cookie) headers.set("cookie", cookie);
  return new Request(`http://localhost${path}`, { ...init, headers });
}

function cookieJar(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((line) => line.split(";")[0])
    .join("; ");
}

describe("HTTP contract", () => {
  it("serves an OpenAPI spec describing the v1 routes", async () => {
    const res = await app.handle(request("/openapi/json"));
    expect(res.status).toBe(200);

    const spec = (await res.json()) as {
      paths: Record<string, { post?: { requestBody?: { content?: Record<string, unknown> } } }>;
    };
    const keys = Object.keys(spec.paths ?? {});

    expect(keys.some((k) => k.startsWith("/v1/health"))).toBe(true);
    expect(keys.some((k) => k.includes("/v1/user/me"))).toBe(true);

    const onboardingKey = keys.find((k) => k.includes("/v1/onboarding"));
    expect(onboardingKey).toBeDefined();
    // The POST body schema is derived from the shared Zod onboardingSchema.
    const post = spec.paths[onboardingKey!].post;
    expect(post?.requestBody?.content?.["application/json"]).toBeDefined();
  });

  it("health returns the ok envelope and echoes x-request-id", async () => {
    const req = request("/v1/health");
    const res = await app.handle(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { status: "ok" } });
    expect(req.headers.get("x-request-id")).toBeTruthy();
  });

  it("answers CORS preflight from WEB_ORIGIN with credentials", async () => {
    const res = await app.handle(
      new Request("http://localhost/v1/health", {
        method: "OPTIONS",
        headers: { origin: webOrigin, "access-control-request-method": "GET" },
      }),
    );
    expect(res.headers.get("access-control-allow-origin")).toBe(webOrigin);
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("does not reflect a foreign origin", async () => {
    const res = await app.handle(
      new Request("http://localhost/v1/health", {
        method: "OPTIONS",
        headers: { origin: "https://evil.example", "access-control-request-method": "GET" },
      }),
    );
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("rejects unauthenticated /v1/user/me with 401", async () => {
    const res = await app.handle(request("/v1/user/me"));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated onboarding POST with 401", async () => {
    const res = await app.handle(
      request("/v1/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "T", startUnitId: "keuangan", dailyGoal: "regular" }),
      }),
    );
    expect(res.status).toBe(401);
  });
});

const realDbSuite = TEST_DATABASE_URL ? describe : describe.skip;

realDbSuite("authenticated onboarding flow (TEST_DATABASE_URL)", () => {
  const email = `contract-${Date.now()}@test.dev`;
  const password = "contract-pass-123";
  const onboardingBody = {
    displayName: "Contract User",
    startUnitId: "keuangan",
    dailyGoal: "regular",
  };
  let cookie = "";
  let user: { id: string };

  beforeAll(async () => {
    const { resolve } = await import("node:path");
    const { getDb } = await import("../../src/database/index.ts");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(getDb(), { migrationsFolder: resolve(import.meta.dir, "../../drizzle") });

    const res = await app.handle(
      request("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Contract User", email, password }),
      }),
    );
    expect(res.status).toBe(200);
    user = ((await res.json()) as { user: { id: string } }).user;
    cookie = cookieJar(res);
  });

  it("reports profile null before onboarding", async () => {
    const res = await app.handle(request("/v1/user/me", {}, cookie));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { profile: unknown } };
    expect(body.data.profile).toBeNull();
  });

  it("creates the profile and rejects a duplicate with 409", async () => {
    const create = await app.handle(
      request(
        "/v1/onboarding",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(onboardingBody),
        },
        cookie,
      ),
    );
    expect(create.status).toBe(200);

    const duplicate = await app.handle(
      request(
        "/v1/onboarding",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(onboardingBody),
        },
        cookie,
      ),
    );
    expect(duplicate.status).toBe(409);
    const duplicateBody = (await duplicate.json()) as { ok: false; error: { code: string } };
    expect(duplicateBody.error.code).toBe("PROFILE_ALREADY_EXISTS");
  });

  it("exposes the stored profile via /v1/user/me", async () => {
    const res = await app.handle(request("/v1/user/me", {}, cookie));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      data: { profile: { displayName: string; startUnitId: string; onboardedAt: string | null } };
    };
    expect(body.data.profile.displayName).toBe("Contract User");
    expect(body.data.profile.startUnitId).toBe("keuangan");
    expect(body.data.profile.onboardedAt).toBeTruthy();
  });

  it("returns a 422 envelope for an invalid authenticated onboarding body", async () => {
    const res = await app.handle(
      request(
        "/v1/onboarding",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            displayName: "",
            startUnitId: "nonexistent",
            dailyGoal: "extreme",
          }),
        },
        cookie,
      ),
    );
    expect(res.status).toBe(422);
    const body = (await res.json()) as { errors: Array<{ path: unknown[] }> };
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it("signs out: clears the session cookies and deletes the server-side session", async () => {
    const signOut = await app.handle(request("/api/auth/sign-out", { method: "POST" }, cookie));
    expect(signOut.status).toBe(200);
    // The browser drops the session cookies (empty value in set-cookie); a
    // request without them is a plain unauthenticated 401 (asserted above).
    expect(
      signOut.headers.getSetCookie().some((l) => l.startsWith("better-auth.session_token=")),
    ).toBe(true);

    const { getDb } = await import("../../src/database/index.ts");
    const { sql } = await import("drizzle-orm");
    const rows = await getDb().execute(sql`SELECT id FROM "session" WHERE user_id = ${user.id}`);
    expect((rows.rows ?? []).length).toBe(0);
  });

  afterAll(async () => {
    const { getDb } = await import("../../src/database/index.ts");
    const { sql } = await import("drizzle-orm");
    await getDb().execute(
      sql`TRUNCATE TABLE "user_profiles", "user", "session", "account", "verification" CASCADE`,
    );
  });
});
