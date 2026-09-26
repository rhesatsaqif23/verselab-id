// Inventory every DB-referenced image: where does it live today?
// Usage: bun src/scripts/inventory-images.ts
// Reports, per row: URL, storage key, present on S3, present in local ./uploads.
// Read-only — safe to run any time.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { isNotNull } from "drizzle-orm";
import { getDb } from "../database/index.ts";
import { contentLessons, contentUnits, userProfiles } from "../database/schema.ts";
import { getStorage, keyFromUrl, mimeForKey } from "../libs/storage.ts";

type Row = { kind: string; id: string; url: string | null };

type Report = Row & {
  key: string | null;
  onS3: boolean | null;
  local: boolean;
};

async function collect(): Promise<Row[]> {
  const db = getDb();
  const units = await db
    .select({ id: contentUnits.id, url: contentUnits.imageUrl })
    .from(contentUnits)
    .where(isNotNull(contentUnits.imageUrl));
  const lessons = await db
    .select({ id: contentLessons.id, url: contentLessons.imageUrl })
    .from(contentLessons)
    .where(isNotNull(contentLessons.imageUrl));
  const avatars = await db
    .select({ id: userProfiles.userId, url: userProfiles.avatarUrl })
    .from(userProfiles)
    .where(isNotNull(userProfiles.avatarUrl));
  return [
    ...units.map((r) => ({ kind: "unit", id: r.id, url: r.url })),
    ...lessons.map((r) => ({ kind: "lesson", id: r.id, url: r.url })),
    ...avatars.map((r) => ({ kind: "avatar", id: r.id, url: r.url })),
  ];
}

async function main(): Promise<void> {
  const rows = await collect();
  const storage = getStorage();
  const reports: Report[] = [];

  for (const row of rows) {
    const key = keyFromUrl(row.url);
    let onS3: boolean | null = null;
    let local = false;
    if (key) {
      try {
        onS3 = (await storage.read(key)) !== null;
      } catch (err) {
        onS3 = false;
        console.error(
          `[inventory] read error for ${key}:`,
          err instanceof Error ? err.message : err,
        );
      }
      local = existsSync(join(process.cwd(), "uploads", key));
    }
    reports.push({ ...row, key, onS3, local });
  }

  const missing = reports.filter((r) => !r.key || r.onS3 !== true);
  const ok = reports.filter((r) => r.key && r.onS3 === true);

  for (const r of reports) {
    const key = r.key ?? "(no key)";
    const s3 = r.onS3 === null ? "ERR" : r.onS3 ? "s3:ok" : "s3:MISSING";
    const loc = r.local ? "local:ok" : "local:missing";
    const status = r.key && r.onS3 ? "OK " : "NEED";
    console.log(`${status} ${r.kind.padEnd(7)} ${r.id} ${key} [${s3}, ${loc}] ${r.url ?? ""}`);
  }

  console.log(
    `\n[inventory] ${rows.length} row(s): ${ok.length} on S3, ${missing.length} need action.`,
  );
  for (const r of missing) {
    const why = !r.key
      ? "unrecognized URL form"
      : !r.local
        ? "MISSING on S3 and no local file (bytes unrecoverable from this machine)"
        : "MISSING on S3 (local file available for upload)";
    console.log(`  - ${r.kind} ${r.id}: ${r.url} — ${why}`);
  }

  // Local files that no DB row references (candidates for deletion).
  const usedKeys = new Set(reports.map((r) => r.key).filter((k): k is string => !!k));
  const uploadsRoot = join(process.cwd(), "uploads");
  if (existsSync(uploadsRoot)) {
    const { readdirSync } = await import("node:fs");
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      );
    const unused = walk(uploadsRoot)
      .map((f) => f.slice(uploadsRoot.length + 1))
      .filter((rel) => !usedKeys.has(rel.replace(/\\/g, "/")));
    console.log(
      `\n[inventory] ${unused.length} local file(s) not referenced by any DB row (delete candidates):`,
    );
    for (const u of unused) console.log(`  - ${u}`);
  }

  // Unit rows still pointing at web-public /unit/* (must move to S3).
  const webPublic = reports.filter((r) => r.url?.startsWith("/unit/"));
  if (webPublic.length) {
    console.log(`\n[inventory] ${webPublic.length} row(s) still serving from web public assets:`);
    for (const r of webPublic)
      console.log(`  - ${r.kind} ${r.id}: ${r.url} (mime: ${r.key ? mimeForKey(r.key) : "?"})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[inventory] Failed:", err);
    process.exit(1);
  });
