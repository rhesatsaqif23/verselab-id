// Title uniqueness: units globally, screens per lesson (non-empty prompts).
// Drives the real services with a mocked database. No Postgres is touched.
import { describe, expect, it, mock } from "bun:test";

let throwCode: string | null = null;

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
  const returning = async (values: unknown) => {
    if (throwCode) {
      const err: any = new Error("duplicate key");
      err.code = throwCode;
      throw err;
    }
    return [{ id: "new-id", ...(values as object) }];
  };
  return {
    select: (_cols?: unknown) => ({
      from: (_table?: unknown) => queryResult(),
    }),
    insert: (_table?: unknown) => ({
      values: (values: unknown) => ({ returning: async () => returning(values) }),
    }),
    update: (_table?: unknown) => ({
      set: (values: unknown) => ({
        where: (_cond?: unknown) => ({ returning: async () => returning(values) }),
      }),
    }),
  };
}

let dbRows: any[] = [];

mock.module("../../src/database/index.ts", () => ({
  getDb: () => makeDb(dbRows),
}));

const { contentUnitService } = await import("../../src/modules/content/unit.service.ts");
const { contentScreenService } = await import("../../src/modules/content/screen.service.ts");
const { AppError } = await import("../../src/libs/errors.ts");

describe("unit title uniqueness", () => {
  it("rejects duplicate titles on create (case-insensitive)", async () => {
    dbRows = [{ id: "u-9", title: "Keuangan" }];

    const err = await contentUnitService
      .createUnit({ title: "  KEUANGAN ", sortOrder: 0 })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
    expect(err.status).toBe(409);
  });

  it("rejects renaming to a sibling title on update", async () => {
    dbRows = [
      { id: "u-1", title: "Lama" },
      { id: "u-2", title: "Keuangan" },
    ];

    const err = await contentUnitService.updateUnit("u-1", { title: "keuangan" }).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("allows keeping its own title", async () => {
    dbRows = [{ id: "u-1", title: "Lama" }];

    const row = await contentUnitService.updateUnit("u-1", { title: "lama" });

    expect(row.id).toBe("new-id");
  });

  it("returns 404 when updating a missing unit", async () => {
    dbRows = [];

    const err = await contentUnitService.updateUnit("nope", { title: "X" }).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("NOT_FOUND");
  });
});

describe("screen prompt uniqueness", () => {
  it("rejects duplicate prompts in the same lesson", async () => {
    dbRows = [{ id: "s-1", lessonId: "l-1", prompt: "Berapa 2+2?" }];

    const err = await contentScreenService
      .createScreen({
        lessonId: "l-1",
        type: "concept",
        prompt: "berapa 2+2? ",
        explain: "",
        sortOrder: 0,
      })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("allows the same prompt in a different lesson", async () => {
    dbRows = [];

    const row = await contentScreenService.createScreen({
      lessonId: "l-2",
      type: "concept",
      prompt: "Berapa 2+2?",
      explain: "",
      sortOrder: 0,
    });

    expect(row.prompt).toBe("Berapa 2+2?");
  });

  it("allows blank prompts to repeat (new screens start blank)", async () => {
    dbRows = [];

    const row = await contentScreenService.createScreen({
      lessonId: "l-1",
      type: "concept",
      prompt: "",
      explain: "",
      sortOrder: 1,
    });

    expect(row.prompt).toBe("");
  });

  it("rejects updating to a sibling prompt", async () => {
    dbRows = [
      { id: "s-1", lessonId: "l-1", prompt: "Lama" },
      { id: "s-2", lessonId: "l-1", prompt: "Sudah ada" },
    ];

    const err = await contentScreenService
      .updateScreen("s-1", { prompt: "sudah ADA" })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CONFLICT");
  });

  it("returns 404 when updating a missing screen", async () => {
    dbRows = [];

    const err = await contentScreenService.updateScreen("nope", { prompt: "X" }).catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("maps a DB race on unique prompt to 409", async () => {
    dbRows = [{ id: "s-1", lessonId: "l-1", prompt: "Lama" }];
    throwCode = "23505";
    try {
      const err = await contentScreenService
        .updateScreen("s-1", { prompt: "Baru" })
        .catch((e) => e);

      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe("CONFLICT");
    } finally {
      throwCode = null;
    }
  });
});
