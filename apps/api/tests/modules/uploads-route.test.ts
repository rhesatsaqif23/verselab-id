// GET /uploads/* streams stored bytes through the storage driver for any
// backend (local disk or S3 via the API's credentials). Hermetic: the fake
// driver stands in for the backend, so no S3 or disk fixture is touched.
import { afterEach, describe, expect, it } from "bun:test";
import { createApp } from "../../src/app.ts";
import { setStorageFake } from "../../src/libs/storage.ts";

const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

afterEach(() => {
  setStorageFake(null);
});

describe("GET /uploads/*", () => {
  it("streams stored bytes with content type and cache headers", async () => {
    setStorageFake({
      put: async () => "",
      delete: async () => {},
      read: async (key: string) => {
        expect(key).toBe("content/__test-route.png");
        return new Uint8Array(bytes);
      },
    });
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/uploads/content/__test-route.png"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array(bytes));
  });

  it("returns 404 for missing objects", async () => {
    setStorageFake({
      put: async () => "",
      delete: async () => {},
      read: async () => null,
    });
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/uploads/content/__missing.png"));

    expect(res.status).toBe(404);
  });

  it("returns 404 for traversal keys", async () => {
    setStorageFake({
      put: async () => "",
      delete: async () => {},
      read: async () => {
        throw new Error("must not be called");
      },
    });
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/uploads/../../etc/passwd"));

    expect(res.status).toBe(404);
  });
});
