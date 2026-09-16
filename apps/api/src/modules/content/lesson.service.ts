import type { CreateLessonInput, UpdateLessonInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentLessons, contentScreens } from "../../database/schema.ts";

export type LessonData = typeof contentLessons.$inferSelect;

export type LessonWithScreens = LessonData & { screens: typeof contentScreens.$inferSelect[] };

export type ContentLessonService = {
  listLessons: (unitId: string) => Promise<LessonData[]>;
  getLesson: (id: string) => Promise<LessonData | null>;
  getLessonWithScreens: (id: string) => Promise<LessonWithScreens | null>;
  createLesson: (input: CreateLessonInput) => Promise<LessonData>;
  updateLesson: (id: string, input: UpdateLessonInput) => Promise<LessonData>;
  deleteLesson: (id: string) => Promise<void>;
  reorderLessons: (ids: string[]) => Promise<void>;
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

  async getLesson(id) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(contentLessons)
      .where(eq(contentLessons.id, id))
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

  async createLesson(input) {
    const db = getDb();
    const sortOrder = input.sortOrder ?? (await getMaxSortOrder(input.unitId)) + 1;
    const [row] = await db
      .insert(contentLessons)
      .values({
        id: input.id,
        unitId: input.unitId,
        title: input.title,
        icon: input.icon,
        sortOrder,
      })
      .returning();
    return row;
  },

  async updateLesson(id, input) {
    const db = getDb();
    const [row] = await db
      .update(contentLessons)
      .set({ ...input, updatedAt: new Date() })
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
};
