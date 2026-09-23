import { describe, expect, it } from "bun:test";
import { mimeForKey, relativeUrlToKey } from "../../src/scripts/backfill-images-to-s3.ts";

describe("relativeUrlToKey", () => {
  it("maps /uploads/content/{id}.png to content/{id}.png", () => {
    expect(relativeUrlToKey("/uploads/content/u-1.png")).toBe("content/u-1.png");
  });

  it("maps /uploads/avatars/{id}.jpg", () => {
    expect(relativeUrlToKey("/uploads/avatars/u-1.jpg")).toBe("avatars/u-1.jpg");
  });

  it("returns null for seeded web-public assets", () => {
    expect(relativeUrlToKey("/unit/keuangan.webp")).toBeNull();
  });

  it("returns null for absolute S3 URLs", () => {
    expect(relativeUrlToKey("https://nos.wjv-1.neo.id/verselab/content/u-1.png")).toBeNull();
  });

  it("returns null for null and empty", () => {
    expect(relativeUrlToKey(null)).toBeNull();
    expect(relativeUrlToKey("")).toBeNull();
  });
});

describe("mimeForKey", () => {
  it("maps known extensions", () => {
    expect(mimeForKey("content/u-1.png")).toBe("image/png");
    expect(mimeForKey("content/u-1.jpg")).toBe("image/jpeg");
    expect(mimeForKey("content/u-1.jpeg")).toBe("image/jpeg");
    expect(mimeForKey("content/u-1.webp")).toBe("image/webp");
  });

  it("returns null for unsupported types", () => {
    expect(mimeForKey("content/u-1.gif")).toBeNull();
    expect(mimeForKey("content/u-1")).toBeNull();
  });
});
