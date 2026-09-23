// Lesson image upload → storage. Drives the real service with a mocked
// database and the in-memory storage fake, plus the real controller over
// app.handle() with a mocked admin session. No S3 or Postgres is touched.
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

const { contentLessonService } = await import("../../src/modules/content/lesson.service.ts");
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

describe("contentLessonService.uploadImage", () => {
  it("uploads to lessons/{id}.png and stores the public URL", async () => {
    setStorageFake({
      put: async (key) => {
        putKeys.push(key);
        return `https://cdn.test/${key}`;
      },
    });

    const result = await contentLessonService.uploadImage("l-1", png());

    expect(putKeys).toEqual(["lessons/l-1.png"]);
    expect(result).toEqual({ imageUrl: "https://cdn.test/lessons/l-1.png" });
    const values = updateCapture.values as { imageUrl: string; updatedAt: Date };
    expect(values.imageUrl).toBe("https://cdn.test/lessons/l-1.png");
    expect(values.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects non-image files with 400", async () => {
    setStorageFake({
      put: async (key) => {
        putKeys.push(key);
        return `https://cdn.test/${key}`;
      },
    });
    const file = new File(["hello"], "note.txt", { type: "text/plain" });

    const err = await contentLessonService.uploadImage("l-1", file).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("BAD_REQUEST");
    expect(putKeys).toEqual([]);
  });

  it("rejects oversized files with 400", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });

    const err = await contentLessonService
      .uploadImage("l-1", png("big.png", MAX_IMAGE_BYTES + 1))
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("BAD_REQUEST");
    expect(putKeys).toEqual([]);
  });

  it("fails with 500 when storage is not configured", async () => {
    // Hermetic against ambient dev .env (see content-unit-image.test.ts).
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
      const err = await contentLessonService.uploadImage("l-1", png()).catch((e) => e);

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

describe("POST /content/lessons/:id/image", () => {
  function imageRequest(cookie: string): Request {
    const form = new FormData();
    form.append("file", png());
    return new Request("http://localhost/content/lessons/l-1/image", {
      method: "POST",
      headers: { cookie },
      body: form,
    });
  }

  it("admin upload returns the storage public URL", async () => {
    setStorageFake({ put: async (key) => `https://cdn.test/${key}` });
    const app = new Elysia().use(createContentController());

    const res = await app.handle(imageRequest("session_token=abc"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      data: { imageUrl: "https://cdn.test/lessons/l-1.png" },
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
