import type { CreateUnitInput, UpdateUnitInput } from "@verselab/shared/schemas/content";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { contentUnits } from "../../database/schema.ts";
import { resolveUniqueSlug } from "./slug.ts";

export type UnitData = typeof contentUnits.$inferSelect;

export type ContentUnitService = {
  listUnits: () => Promise<UnitData[]>;
  getUnit: (id: string) => Promise<UnitData | null>;
  createUnit: (input: CreateUnitInput) => Promise<UnitData>;
  updateUnit: (id: string, input: UpdateUnitInput) => Promise<UnitData>;
  deleteUnit: (id: string) => Promise<void>;
  reorderUnits: (ids: string[]) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<{ imageUrl: string }>;
};

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

  async getUnit(id) {
    const db = getDb();
    const [row] = await db.select().from(contentUnits).where(eq(contentUnits.id, id)).limit(1);
    return row ?? null;
  },

  async createUnit(input) {
    const db = getDb();
    const sortOrder = input.sortOrder ?? (await getMaxSortOrder()) + 1;
    const id = input.id || crypto.randomUUID();
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
    const [row] = await db
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
    return row;
  },

  async updateUnit(id, input) {
    const db = getDb();
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
    const [row] = await db
      .update(contentUnits)
      .set({ ...input, ...(slug ? { slug } : {}), updatedAt: new Date() })
      .where(eq(contentUnits.id, id))
      .returning();
    if (!row) throw new Error("Unit not found");
    return row;
  },

  async deleteUnit(id) {
    const db = getDb();
    await db.delete(contentUnits).where(eq(contentUnits.id, id));
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
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${process.cwd()}/uploads/content/${id}.${ext}`;

    const fs = await import("node:fs/promises");
    await fs.mkdir(`${process.cwd()}/uploads/content`, { recursive: true });
    await fs.writeFile(path, buffer);

    const imageUrl = `/uploads/content/${id}.${ext}`;
    const db = getDb();
    await db
      .update(contentUnits)
      .set({ imageUrl, updatedAt: new Date() })
      .where(eq(contentUnits.id, id));

    return { imageUrl };
  },
};
