import type { Screen, Lesson, Unit } from "#/engine/types.ts";

type DbScreen = {
  id: string;
  lessonId: string;
  type: "concept" | "choice" | "numeric" | "allocation";
  prompt: string;
  explain: string;
  options: { id: string; label: string }[] | null;
  correctId: string | null;
  numericUnit: string | null;
  acceptRangeMin: number | null;
  acceptRangeMax: number | null;
  categories: string[] | null;
  rule: { type: string; categoryId: string; min?: number; max?: number } | null;
  sortOrder: number;
};

type DbLesson = {
  id: string;
  unitId: string;
  title: string;
  slug?: string;
  icon: string | null;
  prerequisite: string | null;
  sortOrder: number;
  screens?: DbScreen[];
};

type DbUnit = {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  lessons?: DbLesson[];
};

export function mapScreen(db: DbScreen): Screen {
  switch (db.type) {
    case "concept":
      return { type: "concept", prompt: db.prompt, explain: db.explain };
    case "choice":
      return {
        type: "choice",
        prompt: db.prompt,
        options: db.options ?? [],
        correctId: db.correctId ?? "",
        explain: db.explain,
      };
    case "numeric":
      return {
        type: "numeric",
        prompt: db.prompt,
        unit: db.numericUnit ?? "",
        acceptRange: [db.acceptRangeMin ?? 0, db.acceptRangeMax ?? Infinity],
        explain: db.explain,
      };
    case "allocation":
      return {
        type: "allocation",
        prompt: db.prompt,
        categories: db.categories ?? [],
        rule: db.rule
          ? { category: db.rule.categoryId, min: db.rule.min, max: db.rule.max }
          : { category: "" },
        explain: db.explain,
      };
  }
}

export function mapLesson(db: DbLesson & { screens?: DbScreen[] }): Lesson {
  return {
    id: db.id,
    title: db.title,
    icon: db.icon ?? undefined,
    prerequisite: db.prerequisite ?? undefined,
    screens: (db.screens ?? []).map(mapScreen),
  };
}

export function mapUnit(db: DbUnit & { lessons?: (DbLesson & { screens?: DbScreen[] })[] }): Unit {
  return {
    id: db.id,
    title: db.title,
    description: db.description ?? undefined,
    imageUrl: db.imageUrl ?? undefined,
    lessons: (db.lessons ?? []).map(mapLesson),
  };
}
