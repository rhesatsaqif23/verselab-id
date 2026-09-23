// Unit image upload → S3. Drives the real service with a mocked database and
// the in-memory storage fake, plus the real controller over app.handle() with
// a mocked admin session. No S3 or Postgres is touched.
import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { env } from "../../src/config/env.ts";

const fakeAdmin = { id: "admin-1", name: "Admin", email: "admin@test.dev" };
const updateCapture: { values?: unknown } = {};
const putKeys: string[] = [];

function makeDb(role: string | null) {
  return {
    update: (_table: unknown) => ({
      set: (values: unknown) => ({
        where: async (_cond: unknown) => {
          updateCapture.values = values;
          return [];
        },
      }),
    }),
    select: (_cols: unknown) => ({
      from: (_table: unknown) => ({
        where: (_cond: unknown) => ({
          limit: async (_n: number) => (role ? [{ role }] : []),
        }),
      }),
    }),
  };
}

let dbStub = makeDb("admin");

mock.module("../../src/database/index.ts", () => ({
  getDb: () => dbStub,
}));

mock.module("../../src/auth/index.ts", () => ({
  auth: {
    api: {
      getSession: async ({ headers }: { headers: Headers }) =>
        headers.get("cookie") ? { user: fakeAdmin, session: { createdAt: new Date() } } : null,
    },
  },
}));

const { contentUnitService } = await import("../../src/modules/content/unit.service.ts");
const { createContentController } = await import("../../src/modules/content/index.ts");
const { setStorageFake, MAX_IMAGE_BYTES } = await import("../../src/libs/storage.ts");
const { AppError } = await import("../../src/libs/errors.ts");

function png(name = "img.png", size = 100): File {
  return new File([new Uint8Array(size)], name, { type: "image/png" });
}

afterEach(() => {
  setStorageFake(null);
  dbStub = makeDb("admin");
  delete updateCapture.values;
  putKeys.length = 0;
});

describe("contentUnitService.uploadImage", () => {
  it("uploads to content/{id}.png and stores the public URL", async () => {
    setStorageFake({
      put: async (key) => {
        putKeys.push(key);
        return `https://cdn.test/${key}`;
      },
    });

    const result = await contentUnitService.uploadImage("u-1", png());

    expect(putKeys).toEqual(["content/u-1.png"]);
    expect(result).toEqual({ imageUrl: "https://cdn.test/content/u-1.png" });
    const values = updateCapture.values as { imageUrl: string; updatedAt: Date };
    expect(values.imageUrl).toBe("https://cdn.test/content/u-1.png");
    expect(values.updatedAt).toBeInstanceOf(Date);
  });

  it("maps webp mime to .webp extension", async () => {
    setStorageFake({
      put: async (key) => {
        putKeys.push(key);
        return `https://cdn.test/${key}`;
      },
    });
    const file = new File([new Uint8Array(10)], "img.webp", { type: "image/webp" });

    const result = await contentUnitService.uploadImage("u-2", file);

    expect(putKeys).toEqual(["content/u-2.webp"]);
    expect(result.imageUrl).toBe("https://cdn.test/content/u-2.webp");
  });

  it("rejects non-image files with 400", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });
    const file = new File(["hello"], "note.txt", { type: "text/plain" });

    const err = await contentUnitService.uploadImage("u-1", file).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.status).toBe(400);
    expect(putKeys).toEqual([]);
  });

  it("rejects oversized files with 400", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });

    const err = await contentUnitService
      .uploadImage("u-1", png("big.png", MAX_IMAGE_BYTES + 1))
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("BAD_REQUEST");
    expect(putKeys).toEqual([]);
  });

  it("fails with 500 when storage is not configured", async () => {
    // Hermetic against ambient dev .env: Bun auto-loads apps/api/.env, which
    // may set STORAGE_DRIVER or S3 keys. Neutralize all driver inputs here.
    const prev = {
      driver: env.STORAGE_DRIVER,
      id: env.S3_ACCESS_KEY_ID,
      secret: env.S3_SECRET_ACCESS_KEY,
    };
    env.STORAGE_DRIVER = undefined;
    env.S3_ACCESS_KEY_ID = undefined;
    env.S3_SECRET_ACCESS_KEY = undefined;
    setStorageFake(null);
    try {
      const err = await contentUnitService.uploadImage("u-1", png()).catch((e) => e);

      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe("INTERNAL");
      expect(err.status).toBe(500);
    } finally {
      env.STORAGE_DRIVER = prev.driver;
      env.S3_ACCESS_KEY_ID = prev.id;
      env.S3_SECRET_ACCESS_KEY = prev.secret;
    }
  });
});

describe("POST /content/units/:id/image", () => {
  function imageRequest(cookie: string): Request {
    const form = new FormData();
    form.append("file", png());
    return new Request("http://localhost/content/units/u-1/image", {
      method: "POST",
      headers: { cookie },
      body: form,
    });
  }

  it("admin upload returns the S3 public URL", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });
    const app = new Elysia().use(createContentController());

    const res = await app.handle(imageRequest("session_token=abc"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      data: { imageUrl: "https://cdn.test/content/u-1.png" },
    });
  });

  it("rejects unauthenticated uploads with 401", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });
    const app = new Elysia().use(createContentController());

    const res = await app.handle(imageRequest(""));

    expect(res.status).toBe(401);
    expect(putKeys).toEqual([]);
  });

  it("rejects non-admin uploads with 403", async () => {
    dbStub = makeDb("user");
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });
    const app = new Elysia().use(createContentController());

    const res = await app.handle(imageRequest("session_token=abc"));

    expect(res.status).toBe(403);
    expect(putKeys).toEqual([]);
  });
});
