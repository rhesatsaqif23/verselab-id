import { describe, expect, it } from "vitest";
import { resolveImageUrl } from "../../src/libs/image.ts";

const ORIGIN = "http://localhost:3001";

describe("resolveImageUrl", () => {
  it("prefixes /uploads/ paths with the API origin", () => {
    expect(resolveImageUrl("/uploads/content/u-1.png", ORIGIN)).toBe(
      "http://localhost:3001/uploads/content/u-1.png",
    );
  });

  it("strips a trailing slash from the origin", () => {
    expect(resolveImageUrl("/uploads/a.png", `${ORIGIN}/`)).toBe(
      "http://localhost:3001/uploads/a.png",
    );
  });

  it("passes S3 absolute URLs through", () => {
    const s3 = "https://nos.wjv-1.neo.id/verselab/content/u-1.png";
    expect(resolveImageUrl(s3, ORIGIN)).toBe(s3);
  });

  it("passes web-public assets through", () => {
    expect(resolveImageUrl("/course-illustration.png", ORIGIN)).toBe("/course-illustration.png");
    expect(resolveImageUrl("/unit/placeholder.webp", ORIGIN)).toBe("/unit/placeholder.webp");
  });

  it("passes data: and blob: previews through", () => {
    expect(resolveImageUrl("data:image/png;base64,abc", ORIGIN)).toBe("data:image/png;base64,abc");
    expect(resolveImageUrl("blob:http://localhost/123", ORIGIN)).toBe("blob:http://localhost/123");
  });

  it("returns undefined for empty values", () => {
    expect(resolveImageUrl(null, ORIGIN)).toBeUndefined();
    expect(resolveImageUrl(undefined, ORIGIN)).toBeUndefined();
    expect(resolveImageUrl("   ", ORIGIN)).toBeUndefined();
  });

  it("degrades to the raw path when origin is missing", () => {
    expect(resolveImageUrl("/uploads/a.png", "")).toBe("/uploads/a.png");
  });
});
