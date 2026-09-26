// Delete cleanup: removing a lesson or unit must not leave dangling
// prerequisiteIds on surviving lessons — learners treat missing prerequisite
// ids as never-completed, so the dependent lesson would stay locked forever.
// Drives the real services with a scripted mock database. No Postgres.
import { describe, expect, it, mock } from "bun:test";

type Row = Record<string, unknown>;

/** Each select() consumes the next scripted batch, in call order. */
let selectQueue: Row[][] = [];
const updates: Row[] = [];
const deletes: unknown[] = [];

function rowsResult(rows: Row[]) {
  // Real drizzle query builders are thenable (await a chain directly). Build
  // on a Promise so `then` comes from the prototype, with chain methods
  // layered on top; `where` is a no-op in this scripted mock.
  return Object.assign(Promise.resolve(rows), {
    limit: async () => rows.slice(0, 1),
    returning: async () => rows,
    orderBy: () => rowsResult(rows),
    where: () => rowsResult(rows),
  });
}

const db = {
  select: (_cols?: unknown) => ({
    from: (_table?: unknown) => rowsResult(selectQueue.shift() ?? []),
  }),
  delete: (_table?: unknown) => ({
    where: (_cond?: unknown) => {
      deletes.push(_table);
      return rowsResult([]);
    },
  }),
  update: (_table?: unknown) => ({
    set: (values: Row) => ({
      where: (_cond?: unknown) => {
        updates.push(values);
        return rowsResult([]);
      },
    }),
  }),
};

mock.module("../../src/database/index.ts", () => ({ getDb: () => db }));

const { contentLessonService } = await import("../../src/modules/content/lesson.service.ts");
const { contentUnitService } = await import("../../src/modules/content/unit.service.ts");

function reset() {
  selectQueue = [];
  updates.length = 0;
  deletes.length = 0;
}

describe("deleteLesson prerequisite cleanup", () => {
  it("removes the deleted lesson id from surviving lessons", async () => {
    reset();
    // 1) lookup of the lesson being deleted, 2) survivors during scrub
    selectQueue = [
      [{ id: "l-1", imageUrl: null }],
      [
        { id: "l-2", prerequisiteIds: ["l-1", "l-3"] },
        { id: "l-3", prerequisiteIds: [] },
        { id: "l-4", prerequisiteIds: null },
      ],
    ];

    await contentLessonService.deleteLesson("l-1");

    expect(deletes.length).toBe(1);
    expect(updates.length).toBe(1);
    expect(updates[0].prerequisiteIds).toEqual(["l-3"]);
  });

  it("touches nothing when no lesson references the deleted one", async () => {
    reset();
    selectQueue = [
      [{ id: "l-1", imageUrl: null }],
      [
        { id: "l-2", prerequisiteIds: ["l-9"] },
        { id: "l-3", prerequisiteIds: null },
      ],
    ];

    await contentLessonService.deleteLesson("l-1");

    expect(updates.length).toBe(0);
  });

  it("clears the array to null when it becomes empty", async () => {
    reset();
    selectQueue = [[{ id: "l-1", imageUrl: null }], [{ id: "l-2", prerequisiteIds: ["l-1"] }]];

    await contentLessonService.deleteLesson("l-1");

    expect(updates.length).toBe(1);
    expect(updates[0].prerequisiteIds).toBeNull();
  });
});

describe("deleteUnit prerequisite cleanup", () => {
  it("scrubs references to lessons that cascade with the unit", async () => {
    reset();
    // 1) unit lookup, 2) lessons of the unit, 3) all survivors during scrub
    selectQueue = [
      [{ id: "u-1", imageUrl: null }],
      [
        { id: "l-1", imageUrl: null },
        { id: "l-2", imageUrl: null },
      ],
      [{ id: "l-x", prerequisiteIds: ["l-1", "l-2", "l-keep"] }],
    ];

    await contentUnitService.deleteUnit("u-1");

    expect(deletes.length).toBe(1);
    expect(updates.length).toBe(1);
    expect(updates[0].prerequisiteIds).toEqual(["l-keep"]);
  });

  it("survives a unit with no lessons and no references", async () => {
    reset();
    selectQueue = [[{ id: "u-1", imageUrl: null }], [], []];

    await contentUnitService.deleteUnit("u-1");

    expect(updates.length).toBe(0);
  });
});
