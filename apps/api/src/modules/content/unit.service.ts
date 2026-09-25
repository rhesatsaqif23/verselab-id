import type { CreateUnitInput, UpdateUnitInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentUnits, contentLessons, contentScreens } from "../../database/schema.ts";
import { AppError, mapUniqueViolation } from "../../libs/errors.ts";
import { assertImage, deleteOldImage, extFor, getStorage } from "../../libs/storage.ts";
import { resolveUniqueSlug } from "./slug.ts";

export type UnitData = typeof contentUnits.$inferSelect;

type LessonRow = typeof contentLessons.$inferSelect;
type ScreenRow = typeof contentScreens.$inferSelect;

export type UnitWithContent = UnitData & {
  lessons: (LessonRow & { screens: ScreenRow[] })[];
};

export type UnitWithContentSingle = UnitData & {
  lessons: (LessonRow & { screens: ScreenRow[] })[];
};

export type ContentUnitService = {
  listUnits: () => Promise<UnitData[]>;
  listUnitsWithContent: () => Promise<UnitWithContent[]>;
  getUnit: (id: string) => Promise<UnitData | null>;
  getUnitWithContent: (id: string) => Promise<UnitWithContentSingle | null>;
  getUnitWithContentBySlug: (slug: string) => Promise<UnitWithContentSingle | null>;
  getUnitBySlug: (slug: string) => Promise<UnitData | null>;
  createUnit: (input: CreateUnitInput) => Promise<UnitData>;
  updateUnit: (id: string, input: UpdateUnitInput) => Promise<UnitData>;
  deleteUnit: (id: string) => Promise<void>;
  reorderUnits: (ids: string[]) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<{ imageUrl: string }>;
};

const DUP_TITLE_MESSAGE = "Judul unit sudah dipakai.";

/** Reject duplicate unit titles (case-insensitive, global scope). */
async function assertUniqueTitle(title: string, excludeId?: string): Promise<void> {
  const db = getDb();
  const rows = await db
    .select({ id: contentUnits.id, title: contentUnits.title })
    .from(contentUnits);
  const wanted = title.trim().toLowerCase();
  if (rows.some((r) => r.id !== excludeId && r.title.trim().toLowerCase() === wanted)) {
    throw new AppError({ code: "CONFLICT", message: DUP_TITLE_MESSAGE });
  }
}

async function getMaxSortOrder(): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ sortOrder: contentUnits.sortOrder })
    .from(contentUnits)
    .orderBy(desc(contentUnits.sortOrder))
    .limit(1);
  return rows[0]?.sortOrder ?? -1;
}

export const contentUnitService: ContentUnitService = {
  async listUnits() {
    const db = getDb();
    return db.select().from(contentUnits).orderBy(asc(contentUnits.sortOrder));
  },

  async listUnitsWithContent() {
    const db = getDb();
    const units = await db.select().from(contentUnits).orderBy(asc(contentUnits.sortOrder));

    const allLessons = await db
      .select()
      .from(contentLessons)
      .orderBy(asc(contentLessons.sortOrder));

    const allScreens = await db
      .select()
      .from(contentScreens)
      .orderBy(asc(contentScreens.sortOrder));

    const screensByLesson = new Map<string, ScreenRow[]>();
    for (const screen of allScreens) {
      const list = screensByLesson.get(screen.lessonId) ?? [];
      list.push(screen);
      screensByLesson.set(screen.lessonId, list);
    }

    const lessonsByUnit = new Map<string, (LessonRow & { screens: ScreenRow[] })[]>();
    for (const lesson of allLessons) {
      const lessons = lessonsByUnit.get(lesson.unitId) ?? [];
      lessons.push({ ...lesson, screens: screensByLesson.get(lesson.id) ?? [] });
      lessonsByUnit.set(lesson.unitId, lessons);
    }

    return units.map((unit) => ({
      ...unit,
      lessons: lessonsByUnit.get(unit.id) ?? [],
    }));
  },

  async getUnit(id) {
    const db = getDb();
    const [row] = await db.select().from(contentUnits).where(eq(contentUnits.id, id)).limit(1);
    return row ?? null;
  },

  async getUnitWithContent(id) {
    const db = getDb();
    const [unit] = await db.select().from(contentUnits).where(eq(contentUnits.id, id)).limit(1);
    if (!unit) return null;

    const lessons = await db
      .select()
      .from(contentLessons)
      .where(eq(contentLessons.unitId, id))
      .orderBy(asc(contentLessons.sortOrder));

    const lessonsWithScreens = await Promise.all(
      lessons.map(async (lesson) => {
        const screens = await db
          .select()
          .from(contentScreens)
          .where(eq(contentScreens.lessonId, lesson.id))
          .orderBy(asc(contentScreens.sortOrder));
        return { ...lesson, screens };
      }),
    );

    return { ...unit, lessons: lessonsWithScreens };
  },

  async getUnitBySlug(slug) {
    const db = getDb();
    const [row] = await db.select().from(contentUnits).where(eq(contentUnits.slug, slug)).limit(1);
    return row ?? null;
  },

  async getUnitWithContentBySlug(slug) {
    const db = getDb();
    const [unit] = await db.select().from(contentUnits).where(eq(contentUnits.slug, slug)).limit(1);
    if (!unit) return null;
    return contentUnitService.getUnitWithContent(unit.id);
  },

  async createUnit(input) {
    const db = getDb();
    const sortOrder = input.sortOrder ?? (await getMaxSortOrder()) + 1;
    const id = input.id || crypto.randomUUID();
    await assertUniqueTitle(input.title);
    const slug = await resolveUniqueSlug(
      { requestedSlug: input.slug, title: input.title },
      async (candidate) => {
        const rows = await db
          .select({ id: contentUnits.id })
          .from(contentUnits)
          .where(eq(contentUnits.slug, candidate))
          .limit(1);
        return rows.length > 0;
      },
    );
    let row;
    try {
      [row] = await db
        .insert(contentUnits)
        .values({
          id,
          title: input.title,
          slug,
          description: input.description,
          imageUrl: input.imageUrl,
          sortOrder,
        })
        .returning();
    } catch (err) {
      mapUniqueViolation(err, DUP_TITLE_MESSAGE);
    }
    return row;
  },

  async updateUnit(id, input) {
    const db = getDb();
    const [existing] = await db
      .select({ id: contentUnits.id, imageUrl: contentUnits.imageUrl })
      .from(contentUnits)
      .where(eq(contentUnits.id, id))
      .limit(1);
    if (!existing) throw new AppError({ code: "NOT_FOUND", message: "Unit tidak ditemukan." });
    if (input.title) {
      await assertUniqueTitle(input.title, id);
    }
    let slug: string | undefined;
    if (input.title) {
      slug = await resolveUniqueSlug(
        { requestedSlug: input.slug, title: input.title },
        async (candidate) => {
          const rows = await db
            .select({ id: contentUnits.id })
            .from(contentUnits)
            .where(eq(contentUnits.slug, candidate))
            .limit(1);
          return rows.length > 0 && rows[0].id !== id;
        },
      );
    }
    let row;
    try {
      [row] = await db
        .update(contentUnits)
        .set({ ...input, ...(slug ? { slug } : {}), updatedAt: new Date() })
        .where(eq(contentUnits.id, id))
        .returning();
    } catch (err) {
      mapUniqueViolation(err, DUP_TITLE_MESSAGE);
    }
    if (!row) throw new AppError({ code: "NOT_FOUND", message: "Unit tidak ditemukan." });
    if (input.imageUrl === null && existing.imageUrl) {
      await deleteOldImage(existing.imageUrl);
    }
    return row;
  },

  async deleteUnit(id) {
    const db = getDb();
    const [unit] = await db
      .select({ imageUrl: contentUnits.imageUrl })
      .from(contentUnits)
      .where(eq(contentUnits.id, id))
      .limit(1);
    const lessons = await db
      .select({ imageUrl: contentLessons.imageUrl })
      .from(contentLessons)
      .where(eq(contentLessons.unitId, id));
    await db.delete(contentUnits).where(eq(contentUnits.id, id));
    // DB first (authoritative); storage cleanup best-effort after.
    for (const imageUrl of [unit?.imageUrl, ...lessons.map((l) => l.imageUrl)]) {
      await deleteOldImage(imageUrl);
    }
  },

  async reorderUnits(ids) {
    const db = getDb();
    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(contentUnits)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(contentUnits.id, ids[i]));
      }
    });
  },

  async uploadImage(id, file) {
    assertImage(file);
    const db = getDb();
    const [existing] = await db
      .select({ imageUrl: contentUnits.imageUrl })
      .from(contentUnits)
      .where(eq(contentUnits.id, id))
      .limit(1);
    const key = `content/${id}.${extFor(file.type)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await getStorage().put(key, buffer, file.type);
    await db
      .update(contentUnits)
      .set({ imageUrl, updatedAt: new Date() })
      .where(eq(contentUnits.id, id));

    await deleteOldImage(existing?.imageUrl, key);
    return { imageUrl };
  },
};
