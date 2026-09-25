// Seed content into the database from the static seed data.
// Usage: bun run --cwd apps/api seed:content

import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedUnits } from "./content-seed-data.ts";
import { getDb } from "../database/index.ts";
import { contentUnits, contentLessons, contentScreens } from "../database/schema.ts";
import { getStorage, mimeForKey } from "../libs/storage.ts";
import { resolveUniqueSlug } from "../modules/content/slug.ts";

type SeedChoiceScreen = {
  type: "choice";
  prompt: string;
  explain: string;
  options: { id: string; label: string }[];
  correctId: string;
};
type SeedNumericScreen = {
  type: "numeric";
  prompt: string;
  explain: string;
  numericUnit: string;
  acceptRangeMin: number;
  acceptRangeMax: number;
};
type SeedAllocationScreen = {
  type: "allocation";
  prompt: string;
  explain: string;
  categories: string[];
  rule: { type: string; categoryId: string; min?: number; max?: number };
};

const ASSETS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "assets");

/**
 * Upload an illustration from assets/ and return its public URL.
 * Returns null (with a warning) when the file is missing or storage is
 * not configured, so seeding never crashes on images.
 */
async function uploadAssetImage(relPath: string, key: string): Promise<string | null> {
  try {
    const buffer = await readFile(join(ASSETS_ROOT, relPath));
    const mime = mimeForKey(relPath) ?? "image/png";
    return await getStorage().put(key, buffer, mime);
  } catch (err) {
    console.warn(`[seed] Skipping image ${relPath}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function seedContent() {
  const db = getDb();

  // Delete existing content (screens first due to FK, then lessons, then units)
  console.log("[seed] Clearing existing content...");
  await db.delete(contentScreens);
  await db.delete(contentLessons);
  await db.delete(contentUnits);

  let unitCount = 0;
  let lessonCount = 0;
  let screenCount = 0;

  for (let unitIdx = 0; unitIdx < seedUnits.length; unitIdx++) {
    const unit = seedUnits[unitIdx];
    const unitSlug = await resolveUniqueSlug({ title: unit.title }, async (candidate) => {
      const rows = await db
        .select({ id: contentUnits.id })
        .from(contentUnits)
        .where(eq(contentUnits.slug, candidate))
        .limit(1);
      return rows.length > 0;
    });

    await db.insert(contentUnits).values({
      id: unit.id,
      title: unit.title,
      slug: unitSlug,
      description: unit.description,
      imageUrl: unit.imageAsset
        ? ((await uploadAssetImage(unit.imageAsset, `content/${unit.id}.png`)) ??
          unit.imageUrl ??
          null)
        : (unit.imageUrl ?? null),
      sortOrder: unitIdx,
    });
    unitCount++;

    for (let lessonIdx = 0; lessonIdx < unit.lessons.length; lessonIdx++) {
      const lesson = unit.lessons[lessonIdx];
      const lessonSlug = await resolveUniqueSlug({ title: lesson.title }, async (candidate) => {
        const rows = await db
          .select({ id: contentLessons.id })
          .from(contentLessons)
          .where(eq(contentLessons.slug, candidate))
          .limit(1);
        return rows.length > 0;
      });

      await db.insert(contentLessons).values({
        id: lesson.id,
        unitId: unit.id,
        title: lesson.title,
        slug: lessonSlug,
        description: lesson.description ?? null,
        icon: null,
        imageUrl: lesson.imageAsset
          ? await uploadAssetImage(lesson.imageAsset, `lessons/${lesson.id}.png`)
          : null,
        prerequisiteIds: lesson.prerequisiteIds ?? null,
        sortOrder: lessonIdx,
      });
      lessonCount++;

      for (let screenIdx = 0; screenIdx < lesson.screens.length; screenIdx++) {
        const screen = lesson.screens[screenIdx];
        const screenId = `${lesson.id}-${screenIdx + 1}`;
        const screenSlug = await resolveUniqueSlug({ title: screen.prompt }, async (candidate) => {
          const rows = await db
            .select({ id: contentScreens.id })
            .from(contentScreens)
            .where(eq(contentScreens.slug, candidate))
            .limit(1);
          return rows.length > 0;
        });

        const base = {
          id: screenId,
          lessonId: lesson.id,
          type: screen.type,
          slug: screenSlug,
          prompt: screen.prompt,
          explain: screen.explain,
          sortOrder: screenIdx,
        };

        if (screen.type === "choice") {
          const s = screen as SeedChoiceScreen;
          await db.insert(contentScreens).values({
            ...base,
            type: "choice",
            options: s.options,
            correctId: s.correctId,
          });
        } else if (screen.type === "numeric") {
          const s = screen as SeedNumericScreen;
          await db.insert(contentScreens).values({
            ...base,
            type: "numeric",
            numericUnit: s.numericUnit,
            acceptRangeMin: s.acceptRangeMin,
            acceptRangeMax: s.acceptRangeMax,
          });
        } else if (screen.type === "allocation") {
          const s = screen as SeedAllocationScreen;
          await db.insert(contentScreens).values({
            ...base,
            type: "allocation",
            categories: s.categories,
            rule: s.rule,
          });
        } else {
          await db.insert(contentScreens).values({
            ...base,
            type: "concept",
          });
        }

        screenCount++;
      }
    }
  }

  console.log(
    `[seed] Done! Inserted ${unitCount} units, ${lessonCount} lessons, ${screenCount} screens.`,
  );
}

seedContent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  });
