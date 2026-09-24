// Lesson validation rules: unique title per unit, no prerequisite cycles.
// Drives the real service with a mocked database. No Postgres is touched.
import { describe, expect, it, mock } from "bun:test";

function makeDb(rows: any[]) {
  const queryResult = () => {
    const r: any = [...rows];
    r.where = (_cond?: unknown) => {
      const w: any = [...rows];
      w.limit = async () => rows;
      return w;
    };
    r.orderBy = (_cond?: unknown) => ({ limit: async () => rows });
    r.limit = async () => rows;
    return r;
  };
  return {
    select: (_cols?: unknown) => ({
      from: (_table?: unknown) => queryResult(),
    }),
    update: (_table?: unknown) => ({
      set: (values: unknown) => ({
        where: (_cond?: unknown) => ({
          returning: async () => [{ id: "l-1", ...(values as object) }],
        }),
      }),
    }),
  };
}

let dbRows: any[] = [];

mock.module("../../src/database/index.ts", () => ({
  getDb: () => makeDb(dbRows),
}));

const { contentLessonService } = await import("../../src/modules/content/lesson.service.ts");
const { AppError } = await import("../../src/libs/errors.ts");

describe("lesson title uniqueness", () => {
  it("rejects duplicate titles on create (case-insensitive)", async () => {
    dbRows = [{ id: "l-9", unitId: "u-1", title: "Estimasi" }];

    const err = await contentLessonService
      .createLesson({ unitId: "u-1", title: "  ESTIMASI ", sortOrder: 0 })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
    expect(err.status).toBe(409);
  });

  it("rejects renaming to a sibling title on update", async () => {
    dbRows = [
      { id: "l-1", unitId: "u-1", title: "Lama", prerequisiteIds: [] },
      { id: "l-2", unitId: "u-1", title: "Estimasi", prerequisiteIds: [] },
    ];

    const err = await contentLessonService
      .updateLesson("l-1", { title: "estimasi" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("allows keeping its own title", async () => {
    dbRows = [{ id: "l-1", unitId: "u-1", title: "Lama", prerequisiteIds: [] }];

    const row = await contentLessonService.updateLesson("l-1", { title: "lama" });

    expect(row.id).toBe("l-1");
  });

  it("returns 404 when updating a missing lesson", async () => {
    dbRows = [];

    const err = await contentLessonService.updateLesson("nope", { title: "X" }).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.status).toBe(404);
  });
});

describe("prerequisite cycle guard", () => {
  it("rejects a lesson depending on itself", async () => {
    dbRows = [{ id: "l-1", unitId: "u-1", title: "A", prerequisiteIds: [] }];

    const err = await contentLessonService
      .updateLesson("l-1", { prerequisiteIds: ["l-1"] })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("rejects a two-lesson cycle", async () => {
    dbRows = [
      { id: "l-1", unitId: "u-1", title: "A", prerequisiteIds: [] },
      { id: "l-2", unitId: "u-1", title: "B", prerequisiteIds: ["l-1"] },
    ];

    const err = await contentLessonService
      .updateLesson("l-1", { prerequisiteIds: ["l-2"] })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("rejects a transitive cycle", async () => {
    dbRows = [
      { id: "l-1", unitId: "u-1", title: "A", prerequisiteIds: [] },
      { id: "l-2", unitId: "u-1", title: "B", prerequisiteIds: ["l-1"] },
      { id: "l-3", unitId: "u-1", title: "C", prerequisiteIds: ["l-2"] },
    ];

    const err = await contentLessonService
      .updateLesson("l-1", { prerequisiteIds: ["l-3"] })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("allows a valid non-cyclic prerequisite", async () => {
    dbRows = [
      { id: "l-1", unitId: "u-1", title: "A", prerequisiteIds: [] },
      { id: "l-2", unitId: "u-1", title: "B", prerequisiteIds: [] },
    ];

    const row = await contentLessonService.updateLesson("l-1", { prerequisiteIds: ["l-2"] });

    expect(row.id).toBe("l-1");
  });
});
