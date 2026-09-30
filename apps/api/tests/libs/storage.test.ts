import { afterEach, describe, expect, it } from "bun:test";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../../src/config/env.ts";
import {
  getStorage,
  isMissingObjectError,
  mimeForKey,
  safeUploadPath,
  setStorageFake,
  toStorageError,
  publicUrl,
  keyFromUrl,
  checkStorageHealth,
} from "../../src/libs/storage.ts";
import { AppError } from "../../src/libs/errors.ts";

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

  it("reads back written bytes and null for a missing key", async () => {
    env.STORAGE_DRIVER = "local";
    const path = join(process.cwd(), "uploads", "content", "__test-storage-read.png");
    try {
      const data = Buffer.from([9, 8, 7]);
      await getStorage().put("content/__test-storage-read.png", data, "image/png");
      const bytes = await getStorage().read("content/__test-storage-read.png");
      expect(bytes).not.toBeNull();
      expect(new Uint8Array(bytes as Uint8Array)).toEqual(new Uint8Array([9, 8, 7]));
      expect(await getStorage().read("content/__missing.png")).toBeNull();
    } finally {
      await unlink(path).catch(() => {});
    }
  });
});

describe("toStorageError", () => {
  function s3Error(code: string, message = code): Error {
    const err: any = new Error(message);
    err.code = code;
    return err;
  }

  it("maps missing bucket to 500 with config message", () => {
    const err = toStorageError(s3Error("NoSuchBucket"), "upload");
    expect(err).toBeInstanceOf(AppError);
    expect(err.status).toBe(500);
    expect(err.message).toContain("Bucket");
  });

  it("maps credential and permission failures to 500", () => {
    for (const code of ["InvalidAccessKeyId", "SignatureDoesNotMatch", "AccessDenied"]) {
      const err = toStorageError(s3Error(code), "upload");
      expect(err.status).toBe(500);
      expect(err.message).toContain("kredensial");
    }
  });

  it("maps throttling to 503", () => {
    for (const code of ["SlowDown", "RequestLimitExceeded", "TooManyRequests"]) {
      const err = toStorageError(s3Error(code), "upload");
      expect(err).toBeInstanceOf(AppError);
      expect(err.status).toBe(503);
    }
  });

  it("maps network failures to 503", () => {
    const err = toStorageError(new TypeError("fetch failed"), "delete");
    expect(err.status).toBe(503);
    expect(err.message).toContain("menghapus");
  });

  it("maps oversized payloads to 400", () => {
    const err = toStorageError(s3Error("EntityTooLarge"), "upload");
    expect(err.status).toBe(400);
  });

  it("falls back to generic 500 with the action verb", () => {
    const err = toStorageError(new Error("weird"), "delete");
    expect(err.status).toBe(500);
    expect(err.message).toContain("menghapus");
  });
});

describe("isMissingObjectError", () => {
  it("treats S3 missing-object messages as null, not failures", () => {
    // Bun's S3Client message for a missing key.
    expect(isMissingObjectError(new Error("The specified key does not exist."))).toBe(true);
    expect(isMissingObjectError(new Error("NoSuchKey"))).toBe(true);
    expect(isMissingObjectError(new Error("NoSuchKey: The specified key does not exist."))).toBe(
      true,
    );
    const coded = new Error("not found");
    (coded as Error & { code?: string }).code = "NotFound";
    expect(isMissingObjectError(coded)).toBe(true);
  });

  it("keeps real failures as failures", () => {
    expect(isMissingObjectError(new Error("Access Denied"))).toBe(false);
    expect(isMissingObjectError(new Error("Connection reset by peer"))).toBe(false);
    expect(isMissingObjectError(null)).toBe(false);
  });
});

describe("checkStorageHealth", () => {
  const realFetch = globalThis.fetch;

  function mockFetch(status: number) {
    globalThis.fetch = (async () => new Response("probe", { status })) as unknown as typeof fetch;
  }

  function restoreFetch() {
    globalThis.fetch = realFetch;
  }

  it("reports write and public read via the fake driver", async () => {
    const puts: string[] = [];
    const deletes: string[] = [];
    setStorageFake({
      put: async (key) => {
        puts.push(key);
        return `https://cdn.test/${key}`;
      },
      delete: async (key: string) => {
        deletes.push(key);
      },
      read: async () => null,
    });
    mockFetch(200);
    try {
      const health = await checkStorageHealth();
      expect(health.writeOk).toBe(true);
      expect(health.publicReadOk).toBe(true);
      expect(puts).toEqual(["health/__probe.txt"]);
      expect(deletes).toEqual(["health/__probe.txt"]);
    } finally {
      restoreFetch();
    }
  });

  it("reports publicReadOk false when anonymous reads are forbidden", async () => {
    setStorageFake({
      put: async (key) => `https://cdn.test/${key}`,
      delete: async (_key: string) => {},
      read: async () => null,
    });
    mockFetch(403);
    try {
      const health = await checkStorageHealth();
      expect(health.writeOk).toBe(true);
      expect(health.publicReadOk).toBe(false);
    } finally {
      restoreFetch();
    }
  });

  it("reports write failure with detail", async () => {
    setStorageFake({
      put: async (_key: string): Promise<string> => {
        throw new AppError({ code: "SERVICE_UNAVAILABLE", message: "down" });
      },
      delete: async (_key: string) => {},
      read: async () => null,
    });
    try {
      const health = await checkStorageHealth();
      expect(health.writeOk).toBe(false);
      expect(health.publicReadOk).toBe(false);
      expect(health.detail).toBe("down");
    } finally {
      restoreFetch();
    }
  });
});

describe("publicUrl", () => {
  const prevBase = env.S3_PUBLIC_BASE_URL;
  const prevEndpoint = env.S3_ENDPOINT;

  afterEach(() => {
    env.S3_PUBLIC_BASE_URL = prevBase;
    env.S3_ENDPOINT = prevEndpoint;
  });

  it("prefers the configured public base URL", () => {
    env.S3_PUBLIC_BASE_URL = "https://nos.example.com/verselab/";
    expect(publicUrl("lessons/a.png")).toMatch(
      /^https:\/\/nos\.example\.com\/verselab\/lessons\/a\.png\?t=\d+$/,
    );
  });

  it("derives one from the endpoint and bucket when no public base is set", () => {
    env.S3_PUBLIC_BASE_URL = undefined;
    env.S3_ENDPOINT = "https://s3.example.com/";
    expect(publicUrl("lessons/a.png")).toMatch(
      /^https:\/\/s3\.example\.com\/verselab\/lessons\/a\.png\?t=\d+$/,
    );
  });

  it("falls back to the API proxy path with no S3 origin", () => {
    env.S3_PUBLIC_BASE_URL = undefined;
    env.S3_ENDPOINT = undefined;
    expect(publicUrl("lessons/a.png")).toMatch(/^\/uploads\/lessons\/a\.png\?t=\d+$/);
  });

  it("round-trips through keyFromUrl", () => {
    env.S3_PUBLIC_BASE_URL = "https://nos.example.com/verselab";
    env.S3_ENDPOINT = undefined;
    expect(keyFromUrl(publicUrl("lessons/a.png"))).toBe("lessons/a.png");
  });
});
