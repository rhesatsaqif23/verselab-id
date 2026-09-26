// Image storage for uploads (unit images, avatars).
// Same philosophy as getDb(): importing the app must not require credentials.
// Tests inject the in-memory fake via setStorageFake() so CI never touches S3.
//
// Two drivers: "s3" (default intent, needs the S3 key pair) and "local"
// (STORAGE_DRIVER=local — writes under ./uploads, served by GET /uploads/*).
// Local keeps the admin usable before the S3 secret lands; flipping to S3
// later is one env change, no code or DB migration.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { env } from "../config/env.ts";
import { AppError } from "./errors.ts";

export type StorageDriver = {
  /** Upload bytes under key, returns the stored URL. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  /** Delete the object under key. Missing keys are ignored. */
  delete(key: string): Promise<void>;
  /** Read bytes under key, or null when the object does not exist. */
  read(key: string): Promise<Uint8Array | null>;
};

let cached: StorageDriver | null = null;
let fake: StorageDriver | null = null;

/** Test seam — call from tests to avoid S3. Pass null to restore. */
export function setStorageFake(driver: StorageDriver | null): void {
  fake = driver;
  cached = null;
}

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** MIME type for a key's extension, or null when the file type is unsupported. */
export function mimeForKey(key: string): string | null {
  const clean = key.split(/[?#]/)[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? null;
}

/** Reject absolute paths and dot-segment escapes; null means "not servable". */
export function safeUploadPath(rel: string): string | null {
  const parts = rel.replace(/\\/g, "/").split("/").filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p === "." || p === "..")) return null;
  return parts.join("/");
}

/**
 * Extract the storage key from a stored image URL (S3 absolute or local
 * relative), stripping ?t= versions. Null when the URL isn't ours.
 */
export function keyFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const clean = url.split(/[?#]/)[0];
  const bases = [env.S3_PUBLIC_BASE_URL, env.S3_ENDPOINT]
    .filter((b): b is string => !!b)
    .map((b) => b.replace(/\/$/, ""));
  for (const base of bases) {
    if (clean.startsWith(`${base}/`)) return clean.slice(base.length + 1) || null;
  }
  if (clean.startsWith("/uploads/")) return clean.slice("/uploads/".length) || null;
  return null;
}

/**
 * Delete a previously stored image by its URL (replace/remove cleanup).
 * Skips when the key equals keepKey (same object just overwritten).
 * Best-effort: logs and swallows failures so DB writes stay authoritative.
 */
export async function deleteOldImage(
  oldUrl: string | null | undefined,
  keepKey?: string,
): Promise<void> {
  const oldKey = keyFromUrl(oldUrl);
  if (!oldKey || oldKey === keepKey) return;
  try {
    await getStorage().delete(oldKey);
  } catch (err) {
    console.warn(`[storage] Failed to delete ${oldKey}:`, err instanceof Error ? err.message : err);
  }
}

function localDriver(): StorageDriver {
  return {
    put: async (key, data) => {
      const rel = safeUploadPath(key);
      if (!rel) throw new AppError({ code: "BAD_REQUEST", message: "Invalid upload key" });
      const path = join(process.cwd(), "uploads", rel);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data);
      return `/uploads/${rel}?t=${Date.now()}`;
    },
    delete: async (key) => {
      const rel = safeUploadPath(key);
      if (!rel) return;
      await rm(join(process.cwd(), "uploads", rel), { force: true });
    },
    read: async (key) => {
      const rel = safeUploadPath(key);
      if (!rel) return null;
      try {
        return await readFile(join(process.cwd(), "uploads", rel));
      } catch {
        return null;
      }
    },
  };
}

/**
 * True when an S3 error means "object does not exist" rather than a real
 * failure. Covers Bun's message ("The specified key does not exist.") and
 * S3 error codes (NoSuchKey / NotFound), so read() returns null instead of
 * throwing a 500 for missing objects.
 */
export function isMissingObjectError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const code = err && typeof err === "object" ? String((err as { code?: unknown }).code ?? "") : "";
  return /NoSuchKey|NotFound|NotExist|404|Not Found|does not exist/i.test(`${code} ${msg}`);
}

export function getStorage(): StorageDriver {
  if (fake) return fake;
  if (cached) return cached;
  if (env.STORAGE_DRIVER === "local") {
    cached = localDriver();
    return cached;
  }
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
      const rel = safeUploadPath(key);
      if (!rel) throw new AppError({ code: "BAD_REQUEST", message: "Invalid upload key" });
      try {
        await client.write(rel, data, { type: contentType });
      } catch (err) {
        throw toStorageError(err, "upload");
      }
      return `/uploads/${rel}?t=${Date.now()}`;
    },
    delete: async (key) => {
      try {
        await client.delete(key);
      } catch (err) {
        throw toStorageError(err, "delete");
      }
    },
    read: async (key) => {
      const rel = safeUploadPath(key);
      if (!rel) return null;
      try {
        const buf = await client.file(rel).arrayBuffer();
        return new Uint8Array(buf);
      } catch (err) {
        if (isMissingObjectError(err)) return null;
        throw toStorageError(err, "read");
      }
    },
  };
  return cached;
}

export const IMAGE_ALLOWLIST = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/**
 * Translate storage backend failures (S3 API errors, network issues) into
 * clear AppErrors. Covers limits and throttling, missing buckets, bad
 * credentials, and connectivity loss.
 */
export function toStorageError(err: unknown, action: "upload" | "delete" | "read"): AppError {
  const verb =
    action === "upload"
      ? "mengunggah gambar"
      : action === "delete"
        ? "menghapus gambar"
        : "memuat gambar";
  const code =
    err && typeof err === "object"
      ? String((err as { code?: unknown }).code ?? (err as { name?: unknown }).name ?? "")
      : "";
  const msg = err instanceof Error ? err.message : String(err ?? "");
  const hay = `${code} ${msg}`;

  if (/NoSuchBucket/i.test(hay)) {
    return new AppError({
      code: "INTERNAL",
      message: "Bucket penyimpanan tidak ditemukan. Periksa konfigurasi S3.",
    });
  }
  if (/InvalidAccessKeyId|SignatureDoesNotMatch|AccessDenied|Forbidden|InvalidSecret/i.test(hay)) {
    return new AppError({
      code: "INTERNAL",
      message: "Akses penyimpanan ditolak. Periksa kredensial dan izin bucket S3.",
    });
  }
  if (/SlowDown|RequestLimitExceeded|TooManyRequests|ServiceUnavailable|503/i.test(hay)) {
    return new AppError({
      code: "SERVICE_UNAVAILABLE",
      message: "Penyimpanan sibuk. Coba lagi sebentar.",
    });
  }
  if (/EntityTooLarge|MaxMessageLengthExceeded/i.test(hay)) {
    return new AppError({ code: "BAD_REQUEST", message: "Ukuran gambar melebihi batas." });
  }
  if (/timeout|Timeout|ECONN|ENOTFOUND|EAI_AGAIN|fetch failed|network|Network/i.test(hay)) {
    return new AppError({
      code: "SERVICE_UNAVAILABLE",
      message: `Tidak dapat terhubung ke penyimpanan saat ${verb}. Periksa koneksi lalu coba lagi.`,
    });
  }
  return new AppError({
    code: "INTERNAL",
    message: `Gagal ${verb}. Coba lagi.`,
  });
}

/**
 * Probe the storage backend: write a tiny file, check anonymous public read
 * (S3 only — local files are served by the app itself), then delete it.
 * Never throws; failures are reported in the result.
 */
export type StorageHealth = {
  driver: string;
  bucket: string | null;
  writeOk: boolean;
  publicReadOk: boolean | null;
  publicUrl: string | null;
  checkedAt: string;
  detail?: string;
};

export async function checkStorageHealth(): Promise<StorageHealth> {
  const base = {
    driver: env.STORAGE_DRIVER ?? "s3",
    bucket: env.S3_BUCKET ?? null,
    checkedAt: new Date().toISOString(),
  };
  const key = "health/__probe.txt";
  const body = `verselab storage probe ${base.checkedAt}`;
  try {
    const storage = getStorage();
    const publicUrl = await storage.put(key, Buffer.from(body), "text/plain");
    if (env.STORAGE_DRIVER === "local") {
      await storage.delete(key).catch(() => {});
      return { ...base, writeOk: true, publicReadOk: null, publicUrl };
    }
    const probeUrl = /^https?:/i.test(publicUrl)
      ? publicUrl.split(/[?#]/)[0]
      : `${(env.S3_PUBLIC_BASE_URL ?? env.S3_ENDPOINT ?? "").replace(/\/$/, "")}/${
          keyFromUrl(publicUrl) ?? publicUrl.replace(/^\/uploads\//, "").split(/[?#]/)[0]
        }`;
    let publicReadOk = false;
    try {
      const res = await fetch(probeUrl);
      publicReadOk = res.ok;
    } catch {
      publicReadOk = false;
    }
    await storage.delete(key).catch(() => {});
    return { ...base, writeOk: true, publicReadOk, publicUrl };
  } catch (err) {
    const mapped = err instanceof AppError ? err : toStorageError(err, "upload");
    return {
      ...base,
      writeOk: false,
      publicReadOk: false,
      publicUrl: null,
      detail: mapped.message,
    };
  }
}

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
