// Normalize already-stored image URLs to the relative /uploads/<key> form so
// every image streams through the API (GET /uploads/*) instead of a public
// bucket URL. Run once after deploying the proxying storage change:
//   bun src/scripts/normalize-image-urls.ts
// Local /uploads/ URLs, seeded /unit/*.webp, and rows with unusable keys are
// left untouched.
import { eq, isNotNull } from "drizzle-orm";
import { getDb } from "../database/index.ts";
import { contentLessons, contentUnits, userProfiles } from "../database/schema.ts";
import { keyFromUrl } from "../libs/storage.ts";

type NormalizedRow = { kind: string; id: string; from: string; to: string };

async function collect(): Promise<NormalizedRow[]> {
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

  const rows: NormalizedRow[] = [];
  for (const r of units) {
    if (r.url && !r.url.startsWith("/uploads/")) {
      rows.push({ kind: "unit", id: r.id, from: r.url, to: "" });
    }
  }
  for (const r of lessons) {
    if (r.url && !r.url.startsWith("/uploads/")) {
      rows.push({ kind: "lesson", id: r.id, from: r.url, to: "" });
    }
  }
  for (const r of avatars) {
    if (r.url && !r.url.startsWith("/uploads/")) {
      rows.push({ kind: "avatar", id: r.id, from: r.url, to: "" });
    }
  }
  return rows;
}

async function normalize(): Promise<void> {
  const db = getDb();
  const rows = await collect();
  console.log(`[normalize] Found ${rows.length} absolute image URL(s) to convert.`);

  let converted = 0;
  for (const row of rows) {
    const key = keyFromUrl(row.from);
    if (!key) {
      console.log(`[normalize] SKIP ${row.kind} ${row.id}: no usable key (${row.from})`);
      continue;
    }
    const to = `/uploads/${key}?t=${Date.now()}`;
    if (row.kind === "unit") {
      await db
        .update(contentUnits)
        .set({ imageUrl: to, updatedAt: new Date() })
        .where(eq(contentUnits.id, row.id));
    } else if (row.kind === "lesson") {
      await db
        .update(contentLessons)
        .set({ imageUrl: to, updatedAt: new Date() })
        .where(eq(contentLessons.id, row.id));
    } else {
      await db
        .update(userProfiles)
        .set({ avatarUrl: to, updatedAt: new Date() })
        .where(eq(userProfiles.userId, row.id));
    }
    row.to = to;
    console.log(`[normalize] ${row.kind} ${row.id}: ${row.from} -> ${to}`);
    converted++;
  }

  console.log(`[normalize] Done! Converted ${converted}, skipped ${rows.length - converted}.`);
}

if (import.meta.main) {
  normalize()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[normalize] Failed:", err);
      process.exit(1);
    });
}
