// Lazy S3 storage for image uploads (unit images, avatars).
// Same philosophy as getDb(): importing the app must not require credentials.
// Tests inject the in-memory fake via setStorageFake() so CI never touches S3.
import { env } from "../config/env.ts";
import { AppError } from "./errors.ts";

export type StorageDriver = {
  /** Upload bytes under key, returns the public URL. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
};

let cached: StorageDriver | null = null;
let fake: StorageDriver | null = null;

/** Test seam — call from tests to avoid S3. Pass null to restore. */
export function setStorageFake(driver: StorageDriver | null): void {
  fake = driver;
  cached = null;
}

export function getStorage(): StorageDriver {
  if (fake) return fake;
  if (cached) return cached;
  const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = env;
  if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new AppError({ code: "INTERNAL", message: "S3 storage not configured" });
  }
  const client = new Bun.S3Client({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    bucket: S3_BUCKET ?? "verselab",
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
  });
  cached = {
    put: async (key, data, contentType) => {
      await client.write(key, data, { type: contentType });
      const base = (env.S3_PUBLIC_BASE_URL ?? S3_ENDPOINT ?? "").replace(/\/$/, "");
      return `${base}/${key}`;
    },
  };
  return cached;
}

export const IMAGE_ALLOWLIST = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Shared upload guards (reuse in both upload services). */
export function assertImage(file: File): void {
  if (!(IMAGE_ALLOWLIST as readonly string[]).includes(file.type)) {
    throw new AppError({ code: "BAD_REQUEST", message: "Only JPEG/PNG/WebP allowed" });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new AppError({ code: "BAD_REQUEST", message: "Image too large (max 2MB)" });
  }
}

export function extFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
