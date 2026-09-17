// Seed content into the database from the static seed data.
// Usage: bun run --cwd apps/api seed:content

import { seedUnits } from "./content-seed-data.ts";
import { getDb } from "../database/index.ts";
import { contentUnits, contentLessons, contentScreens } from "../database/schema.ts";

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

    await db.insert(contentUnits).values({
      id: unit.id,
      title: unit.title,
      slug: unit.id,
      description: unit.description,
      imageUrl: unit.imageUrl,
      sortOrder: unitIdx,
    });
    unitCount++;

    for (let lessonIdx = 0; lessonIdx < unit.lessons.length; lessonIdx++) {
      const lesson = unit.lessons[lessonIdx];

      await db.insert(contentLessons).values({
        id: lesson.id,
        unitId: unit.id,
        title: lesson.title,
        slug: lesson.id,
        icon: lesson.icon,
        sortOrder: lessonIdx,
      });
      lessonCount++;

      for (let screenIdx = 0; screenIdx < lesson.screens.length; screenIdx++) {
        const screen = lesson.screens[screenIdx];

        const base = {
          id: `${lesson.id}-screen-${screenIdx}`,
          lessonId: lesson.id,
          type: screen.type,
          slug: `${lesson.id}-screen-${screenIdx}`,
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
