import type { CreateScreenInput, UpdateScreenInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentScreens, contentLessons, contentUnits } from "../../database/schema.ts";
import { resolveUniqueSlug } from "./slug.ts";

export type ScreenData = typeof contentScreens.$inferSelect;

export type ScreenWithLesson = ScreenData & {
  lessonTitle: string;
  unitId: string;
  unitSlug: string;
  lessonSlug: string;
};

export type ContentScreenService = {
  listScreens: (lessonId: string) => Promise<ScreenData[]>;
  listAllScreens: () => Promise<ScreenWithLesson[]>;
  getScreen: (id: string) => Promise<ScreenData | null>;
  createScreen: (input: CreateScreenInput) => Promise<ScreenData>;
  updateScreen: (id: string, input: UpdateScreenInput) => Promise<ScreenData>;
  deleteScreen: (id: string) => Promise<void>;
  reorderScreens: (ids: string[]) => Promise<void>;
};

async function getMaxSortOrder(lessonId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ sortOrder: contentScreens.sortOrder })
    .from(contentScreens)
    .where(eq(contentScreens.lessonId, lessonId))
    .orderBy(desc(contentScreens.sortOrder))
    .limit(1);
  return rows[0]?.sortOrder ?? -1;
}

export const contentScreenService: ContentScreenService = {
  async listScreens(lessonId) {
    const db = getDb();
    return db
      .select()
      .from(contentScreens)
      .where(eq(contentScreens.lessonId, lessonId))
      .orderBy(asc(contentScreens.sortOrder));
  },

  async listAllScreens() {
    const db = getDb();
    const rows = await db
      .select({
        id: contentScreens.id,
        lessonId: contentScreens.lessonId,
        type: contentScreens.type,
        slug: contentScreens.slug,
        prompt: contentScreens.prompt,
        explain: contentScreens.explain,
        options: contentScreens.options,
        correctId: contentScreens.correctId,
        numericUnit: contentScreens.numericUnit,
        acceptRangeMin: contentScreens.acceptRangeMin,
        acceptRangeMax: contentScreens.acceptRangeMax,
        categories: contentScreens.categories,
        rule: contentScreens.rule,
        sortOrder: contentScreens.sortOrder,
        createdAt: contentScreens.createdAt,
        updatedAt: contentScreens.updatedAt,
        lessonTitle: contentLessons.title,
        lessonSlug: contentLessons.slug,
        unitId: contentLessons.unitId,
        unitSlug: contentUnits.slug,
      })
      .from(contentScreens)
      .innerJoin(contentLessons, eq(contentScreens.lessonId, contentLessons.id))
      .innerJoin(contentUnits, eq(contentLessons.unitId, contentUnits.id))
      .orderBy(asc(contentScreens.sortOrder));
    return rows;
  },

  async getScreen(id) {
    const db = getDb();
    const [row] = await db.select().from(contentScreens).where(eq(contentScreens.id, id)).limit(1);
    return row ?? null;
  },

  async createScreen(input) {
    const db = getDb();
    const sortOrder = input.sortOrder ?? (await getMaxSortOrder(input.lessonId)) + 1;
    const id = input.id || crypto.randomUUID();
    const slug = await resolveUniqueSlug(
      { requestedSlug: input.slug, title: input.prompt },
      async (candidate) => {
        const rows = await db
          .select({ id: contentScreens.id })
          .from(contentScreens)
          .where(eq(contentScreens.slug, candidate))
          .limit(1);
        return rows.length > 0;
      },
    );
    const [row] = await db
      .insert(contentScreens)
      .values({
        id,
        lessonId: input.lessonId,
        type: input.type,
        slug,
        prompt: input.prompt,
        explain: input.explain,
        options: input.options,
        correctId: input.correctId,
        numericUnit: input.numericUnit,
        acceptRangeMin: input.acceptRangeMin,
        acceptRangeMax: input.acceptRangeMax,
        categories: input.categories,
        rule: input.rule,
        sortOrder,
      })
      .returning();
    return row;
  },

  async updateScreen(id, input) {
    const db = getDb();
    let slug: string | undefined;
    if (input.prompt) {
      slug = await resolveUniqueSlug(
        { requestedSlug: input.slug, title: input.prompt },
        async (candidate) => {
          const rows = await db
            .select({ id: contentScreens.id })
            .from(contentScreens)
            .where(eq(contentScreens.slug, candidate))
            .limit(1);
          return rows.length > 0 && rows[0].id !== id;
        },
      );
    }
    const [row] = await db
      .update(contentScreens)
      .set({ ...input, ...(slug ? { slug } : {}), updatedAt: new Date() })
      .where(eq(contentScreens.id, id))
      .returning();
    if (!row) throw new Error("Screen not found");
    return row;
  },

  async deleteScreen(id) {
    const db = getDb();
    await db.delete(contentScreens).where(eq(contentScreens.id, id));
  },

  async reorderScreens(ids) {
    const db = getDb();
    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(contentScreens)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(contentScreens.id, ids[i]));
      }
    });
  },
};
