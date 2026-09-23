import type { CreateLessonInput, UpdateLessonInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentLessons, contentScreens, contentUnits } from "../../database/schema.ts";
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
    const [row] = await db
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
    return row;
  },

  async updateLesson(id, input) {
    const db = getDb();
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
    const [row] = await db
      .update(contentLessons)
      .set({ ...input, ...(slug ? { slug } : {}), updatedAt: new Date() })
      .where(eq(contentLessons.id, id))
      .returning();
    if (!row) throw new Error("Lesson not found");
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
