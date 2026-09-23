// Backfill relative /uploads/... image URLs to S3.
// Usage:
//   bun src/scripts/backfill-images-to-s3.ts           # dry-run (default, no writes)
//   bun src/scripts/backfill-images-to-s3.ts --apply   # upload to S3 + update rows
//
// Only rows whose URL starts with "/uploads/" are touched. Seeded /unit/*.webp
// (web-public assets) and absolute URLs are skipped. Rows whose local file no
// longer exists are reported and left untouched.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { eq, like } from "drizzle-orm";
import { getDb } from "../database/index.ts";
import { contentUnits, userProfiles } from "../database/schema.ts";
import { getStorage } from "../libs/storage.ts";

const UPLOADS_PREFIX = "/uploads/";

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** Map a stored URL to its S3 key, or null when the row needs no migration. */
export function relativeUrlToKey(url: string | null): string | null {
  if (!url || !url.startsWith(UPLOADS_PREFIX)) return null;
  return url.slice(UPLOADS_PREFIX.length);
}

/** MIME type for a key's extension, or null when the file type is unsupported. */
export function mimeForKey(key: string): string | null {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? null;
}

type BackfillRow = { id: string; url: string; kind: "unit" | "avatar" };

async function collectRows(): Promise<BackfillRow[]> {
  const db = getDb();
  const units = await db
    .select({ id: contentUnits.id, url: contentUnits.imageUrl })
    .from(contentUnits)
    .where(like(contentUnits.imageUrl, `${UPLOADS_PREFIX}%`));
  const avatars = await db
    .select({ id: userProfiles.userId, url: userProfiles.avatarUrl })
    .from(userProfiles)
    .where(like(userProfiles.avatarUrl, `${UPLOADS_PREFIX}%`));
  return [
    ...units.map((r) => ({ id: r.id, url: r.url as string, kind: "unit" as const })),
    ...avatars.map((r) => ({ id: r.id, url: r.url as string, kind: "avatar" as const })),
  ];
}

async function backfill(apply: boolean): Promise<void> {
  const rows = await collectRows();
  console.log(`[backfill] Found ${rows.length} row(s) with relative /uploads/ URLs.`);

  let uploaded = 0;
  let skipped = 0;
  for (const row of rows) {
    const key = relativeUrlToKey(row.url);
    if (!key) {
      skipped++;
      continue;
    }
    const mime = mimeForKey(key);
    const localPath = join(process.cwd(), "uploads", key);
    if (!mime || !existsSync(localPath)) {
      console.log(
        `[backfill] SKIP ${row.kind} ${row.id}: ${!mime ? "unsupported type" : "missing file"} (${row.url})`,
      );
      skipped++;
      continue;
    }
    if (!apply) {
      console.log(`[backfill] WOULD upload ${row.kind} ${row.id}: ${row.url} -> s3:${key}`);
      continue;
    }
    const buffer = readFileSync(localPath);
    const publicUrl = await getStorage().put(key, buffer, mime);
    const db = getDb();
    if (row.kind === "unit") {
      await db
        .update(contentUnits)
        .set({ imageUrl: publicUrl, updatedAt: new Date() })
        .where(eq(contentUnits.id, row.id));
    } else {
      await db
        .update(userProfiles)
        .set({ avatarUrl: publicUrl, updatedAt: new Date() })
        .where(eq(userProfiles.userId, row.id));
    }
    console.log(`[backfill] Uploaded ${row.kind} ${row.id} -> ${publicUrl}`);
    uploaded++;
  }

  console.log(
    `[backfill] Done! ${apply ? `Uploaded ${uploaded}, skipped ${skipped}.` : `Dry run — no writes. ${rows.length - skipped} row(s) would upload, ${skipped} skipped.`}`,
  );
}

if (import.meta.main) {
  const apply = process.argv.includes("--apply");
  if (!apply) {
    console.log("[backfill] Dry-run mode. Pass --apply to upload and update rows.");
  }
  backfill(apply)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[backfill] Failed:", err);
      process.exit(1);
    });
}
