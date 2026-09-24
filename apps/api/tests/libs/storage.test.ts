import { afterEach, describe, expect, it } from "bun:test";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../../src/config/env.ts";
import { getStorage, mimeForKey, safeUploadPath, setStorageFake } from "../../src/libs/storage.ts";

const prevDriver = env.STORAGE_DRIVER;

afterEach(() => {
  env.STORAGE_DRIVER = prevDriver;
  setStorageFake(null);
});

describe("safeUploadPath", () => {
  it("accepts nested keys", () => {
    expect(safeUploadPath("content/u-1.png")).toBe("content/u-1.png");
    expect(safeUploadPath("avatars/u-1.jpg")).toBe("avatars/u-1.jpg");
  });

  it("rejects traversal, absolute paths, and empties", () => {
    expect(safeUploadPath("../package.json")).toBeNull();
    expect(safeUploadPath("content/../../x")).toBeNull();
    expect(safeUploadPath("/etc/passwd")).toBe("etc/passwd");
    expect(safeUploadPath("")).toBeNull();
    expect(safeUploadPath(".")).toBeNull();
  });
});

describe("mimeForKey", () => {
  it("maps image extensions and rejects the rest", () => {
    expect(mimeForKey("a.png")).toBe("image/png");
    expect(mimeForKey("a.webp")).toBe("image/webp");
    expect(mimeForKey("a.gif")).toBeNull();
  });
});

describe("local driver", () => {
  it("writes under ./uploads and returns the public path", async () => {
    env.STORAGE_DRIVER = "local";
    const data = Buffer.from([1, 2, 3]);
    const path = join(process.cwd(), "uploads", "content", "__test-storage.png");
    try {
      const url = await getStorage().put("content/__test-storage.png", data, "image/png");
      expect(url).toMatch(/^\/uploads\/content\/__test-storage\.png\?t=\d+$/);
      const bytes = new Uint8Array(await Bun.file(path).arrayBuffer());
      expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
    } finally {
      await unlink(path).catch(() => {});
    }
  });

  it("rejects traversal keys with 400", async () => {
    env.STORAGE_DRIVER = "local";
    const err = await getStorage()
      .put("../__evil.png", Buffer.from([0]), "image/png")
      .catch((e) => e);
    expect(err.code).toBe("BAD_REQUEST");
  });
});
