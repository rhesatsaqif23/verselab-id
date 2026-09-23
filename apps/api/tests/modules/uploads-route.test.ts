// GET /uploads/* serves local uploads (STORAGE_DRIVER=local).
// Fixture files are created under ./uploads and removed afterwards.
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createApp } from "../../src/app.ts";

const dir = join(process.cwd(), "uploads", "content");
const fixture = join(dir, "__test-route.png");
const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

beforeAll(async () => {
  await mkdir(dir, { recursive: true });
  await writeFile(fixture, bytes);
});

afterAll(async () => {
  await rm(fixture, { force: true });
});

describe("GET /uploads/*", () => {
  it("serves stored files with content type and cache headers", async () => {
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/uploads/content/__test-route.png"));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array(bytes));
  });

  it("returns 404 for missing files", async () => {
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/uploads/content/__missing.png"));

    expect(res.status).toBe(404);
  });
});
