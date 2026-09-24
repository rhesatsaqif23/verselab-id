import type { CreateLessonInput, UpdateLessonInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentLessons, contentScreens, contentUnits } from "../../database/schema.ts";
import { AppError, mapUniqueViolation } from "../../libs/errors.ts";
import { assertImage, extFor, getStorage } from "../../libs/storage.ts";
import { resolveUniqueSlug } from "./slug.ts";

export type LessonData = typeof contentLessons.$inferSelect;

export type LessonWithScreens = LessonData & { screens: (typeof contentScreens.$inferSelect)[] };

export type LessonWithUnit = LessonData & { unitTitle: string; unitSlug: string };

export type LessonFull = LessonData & {
  screens: (typeof contentScreens.$inferSelect)[];
  unitTitle: string;
  unitSlug: string;
};

export type ContentLessonService = {
  listLessons: (unitId: string) => Promise<LessonData[]>;
  listAllLessons: () => Promise<LessonWithUnit[]>;
  getLesson: (id: string) => Promise<LessonData | null>;
  getLessonBySlug: (slug: string) => Promise<LessonData | null>;
  getLessonWithScreens: (id: string) => Promise<LessonWithScreens | null>;
  getLessonFull: (id: string) => Promise<LessonFull | null>;
  createLesson: (input: CreateLessonInput) => Promise<LessonData>;
  updateLesson: (id: string, input: UpdateLessonInput) => Promise<LessonData>;
  deleteLesson: (id: string) => Promise<void>;
  reorderLessons: (ids: string[]) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<{ imageUrl: string }>;
};

async function getMaxSortOrder(unitId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ sortOrder: contentLessons.sortOrder })
    .from(contentLessons)
    .where(eq(contentLessons.unitId, unitId))
    .orderBy(desc(contentLessons.sortOrder))
    .limit(1);
  return rows[0]?.sortOrder ?? -1;
}

/** Reject duplicate lesson titles within a unit (case-insensitive). */
async function assertUniqueTitle(unitId: string, title: string, excludeId?: string): Promise<void> {
  const db = getDb();
  const siblings = await db
    .select({ id: contentLessons.id, title: contentLessons.title })
    .from(contentLessons)
    .where(eq(contentLessons.unitId, unitId));
  const wanted = title.trim().toLowerCase();
  if (siblings.some((s) => s.id !== excludeId && s.title.trim().toLowerCase() === wanted)) {
    throw new AppError({ code: "CONFLICT", message: "Judul lesson sudah dipakai di unit ini." });
  }
}

/** Map Postgres unique violations to a clear conflict error (covers races
 * past the application-level duplicate check). */
const DUP_TITLE_MESSAGE = "Judul lesson sudah dipakai di unit ini.";

/**
 * Reject prerequisite selections that would create a cycle: the lesson itself
 * or any lesson that already (transitively) depends on it.
 */
async function assertNoPrerequisiteCycle(
  lessonId: string,
  prerequisiteIds: string[],
): Promise<void> {
  if (prerequisiteIds.length === 0) return;
  const db = getDb();
  const all = await db
    .select({ id: contentLessons.id, prerequisiteIds: contentLessons.prerequisiteIds })
    .from(contentLessons);
  const edges = new Map(all.map((r) => [r.id, r.prerequisiteIds ?? []]));
  const stack = [...prerequisiteIds];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (current === lessonId) {
      throw new AppError({
        code: "CONFLICT",
        message:
          "Prasyarat tidak boleh berputar. Pilihan tersebut sudah bergantung pada lesson ini.",
      });
    }
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of edges.get(current) ?? []) stack.push(next);
  }
}

export const contentLessonService: ContentLessonService = {
  async listLessons(unitId) {
    const db = getDb();
    return db
      .select()
      .from(contentLessons)
      .where(eq(contentLessons.unitId, unitId))
      .orderBy(asc(contentLessons.sortOrder));
  },

  async listAllLessons() {
    const db = getDb();
    const rows = await db
      .select({
        id: contentLessons.id,
        unitId: contentLessons.unitId,
        title: contentLessons.title,
        slug: contentLessons.slug,
        description: contentLessons.description,
        icon: contentLessons.icon,
        imageUrl: contentLessons.imageUrl,
        prerequisiteIds: contentLessons.prerequisiteIds,
        sortOrder: contentLessons.sortOrder,
        createdAt: contentLessons.createdAt,
        updatedAt: contentLessons.updatedAt,
        unitTitle: contentUnits.title,
        unitSlug: contentUnits.slug,
      })
      .from(contentLessons)
      .innerJoin(contentUnits, eq(contentLessons.unitId, contentUnits.id))
      .orderBy(asc(contentLessons.sortOrder));
    return rows;
  },

  async getLesson(id) {
    const db = getDb();
    const [row] = await db.select().from(contentLessons).where(eq(contentLessons.id, id)).limit(1);
    return row ?? null;
  },

  async getLessonBySlug(slug) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(contentLessons)
      .where(eq(contentLessons.slug, slug))
      .limit(1);
    return row ?? null;
  },

  async getLessonWithScreens(id) {
    const db = getDb();
    const [lesson] = await db
      .select()
      .from(contentLessons)
      .where(eq(contentLessons.id, id))
      .limit(1);
    if (!lesson) return null;

    const screens = await db
      .select()
      .from(contentScreens)
      .where(eq(contentScreens.lessonId, id))
      .orderBy(asc(contentScreens.sortOrder));

    return { ...lesson, screens };
  },

  async getLessonFull(id) {
    const db = getDb();
    const [lesson] = await db
      .select()
      .from(contentLessons)
      .innerJoin(contentUnits, eq(contentLessons.unitId, contentUnits.id))
      .where(eq(contentLessons.id, id))
      .limit(1);
    if (!lesson) return null;

    const screens = await db
      .select()
      .from(contentScreens)
      .where(eq(contentScreens.lessonId, id))
      .orderBy(asc(contentScreens.sortOrder));

    return {
      id: lesson.content_lessons.id,
      unitId: lesson.content_lessons.unitId,
      title: lesson.content_lessons.title,
      slug: lesson.content_lessons.slug,
      description: lesson.content_lessons.description,
      icon: lesson.content_lessons.icon,
      imageUrl: lesson.content_lessons.imageUrl,
      prerequisiteIds: lesson.content_lessons.prerequisiteIds,
      sortOrder: lesson.content_lessons.sortOrder,
      createdAt: lesson.content_lessons.createdAt,
      updatedAt: lesson.content_lessons.updatedAt,
      screens,
      unitTitle: lesson.content_units.title,
      unitSlug: lesson.content_units.slug,
    };
  },

  async createLesson(input) {
    const db = getDb();
    const sortOrder = input.sortOrder ?? (await getMaxSortOrder(input.unitId)) + 1;
    const id = input.id || crypto.randomUUID();
    await assertUniqueTitle(input.unitId, input.title);
    const slug = await resolveUniqueSlug(
      { requestedSlug: input.slug, title: input.title },
      async (candidate) => {
        const rows = await db
          .select({ id: contentLessons.id })
          .from(contentLessons)
          .where(eq(contentLessons.slug, candidate))
          .limit(1);
        return rows.length > 0;
      },
    );
    let row;
    try {
      [row] = await db
        .insert(contentLessons)
        .values({
          id,
          unitId: input.unitId,
          title: input.title,
          slug,
          description: input.description,
          icon: input.icon,
          imageUrl: input.imageUrl,
          prerequisiteIds: input.prerequisiteIds,
          sortOrder,
        })
        .returning();
    } catch (err) {
      mapUniqueViolation(err, DUP_TITLE_MESSAGE);
    }
    return row;
  },

  async updateLesson(id, input) {
    const db = getDb();
    const [existing] = await db
      .select({ id: contentLessons.id, unitId: contentLessons.unitId })
      .from(contentLessons)
      .where(eq(contentLessons.id, id))
      .limit(1);
    if (!existing) throw new AppError({ code: "NOT_FOUND", message: "Lesson tidak ditemukan." });
    if (input.title) {
      await assertUniqueTitle(existing.unitId, input.title, id);
    }
    if (input.prerequisiteIds) {
      await assertNoPrerequisiteCycle(id, input.prerequisiteIds);
    }
    let slug: string | undefined;
    if (input.title) {
      slug = await resolveUniqueSlug(
        { requestedSlug: input.slug, title: input.title },
        async (candidate) => {
          const rows = await db
            .select({ id: contentLessons.id })
            .from(contentLessons)
            .where(eq(contentLessons.slug, candidate))
            .limit(1);
          return rows.length > 0 && rows[0].id !== id;
        },
      );
    }
    let row;
    try {
      [row] = await db
        .update(contentLessons)
        .set({ ...input, ...(slug ? { slug } : {}), updatedAt: new Date() })
        .where(eq(contentLessons.id, id))
        .returning();
    } catch (err) {
      mapUniqueViolation(err, DUP_TITLE_MESSAGE);
    }
    if (!row) throw new AppError({ code: "NOT_FOUND", message: "Lesson tidak ditemukan." });
    return row;
  },

  async deleteLesson(id) {
    const db = getDb();
    await db.delete(contentLessons).where(eq(contentLessons.id, id));
  },

  async reorderLessons(ids) {
    const db = getDb();
    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(contentLessons)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(contentLessons.id, ids[i]));
      }
    });
  },

  async uploadImage(id, file) {
    assertImage(file);
    const key = `lessons/${id}.${extFor(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await getStorage().put(key, buffer, file.type);
    const db = getDb();
    await db
      .update(contentLessons)
      .set({ imageUrl, updatedAt: new Date() })
      .where(eq(contentLessons.id, id));

    return { imageUrl };
  },
};
