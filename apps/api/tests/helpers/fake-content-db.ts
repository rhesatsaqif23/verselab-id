// In-memory stand-in for the drizzle/Postgres database, sufficient for the
// content services (unit/lesson/screen CRUD). Drives the real services and
// controllers over app.handle() — only the SQL execution layer is replaced.
//
// Supports exactly the query shapes the content modules use:
//   select([cols]).from(t)[.innerJoin(t, eq)][.where(eq)][.orderBy(desc|asc)][.limit(n)]
//   insert(t).values(row).returning()
//   update(t).set(vals).where(eq)[.returning()]
//   delete(t).where(eq)
//   transaction(cb)
// Conditions are evaluated by parsing drizzle's SQL queryChunks (eq only).
type Row = Record<string, unknown>;

const tables = new Map<object, Row[]>();
const keyCache = new Map<object, string>();

function isColumn(x: unknown): x is { name: string; table: object } {
  return typeof x === "object" && x !== null && "table" in x && "dataType" in x && "name" in x;
}

function isParam(x: unknown): x is { value: unknown } {
  return typeof x === "object" && x !== null && "value" in x && "encoder" in x;
}

/** Map a drizzle column back to its TypeScript property key on stored rows. */
function keyOf(col: { name: string; table: object }): string {
  const cached = keyCache.get(col);
  if (cached) return cached;
  let key = col.name;
  for (const k of Object.keys(col.table)) {
    if ((col.table as Record<string, unknown>)[k] === col) {
      key = k;
      break;
    }
  }
  keyCache.set(col, key);
  return key;
}

function tableName(table: object): string {
  return String((table as Record<symbol, unknown>)[Symbol.for("drizzle:Name")]);
}

function isTableColumn(value: unknown): value is { name: string; table: object } {
  return isColumn(value);
}

function columnEntries(table: object): [string, { name: string; table: object }][] {
  return Object.entries(table).filter((e): e is [string, { name: string; table: object }] =>
    isTableColumn(e[1]),
  );
}

function eqRefs(cond: unknown): { left: unknown; right: unknown } | null {
  const chunks = (cond as { queryChunks?: unknown[] } | null)?.queryChunks;
  if (!Array.isArray(chunks)) return null;
  const refs = chunks.filter((c) => isColumn(c) || isParam(c));
  if (refs.length < 2) return null;
  return { left: refs[0], right: refs[1] };
}

type Sides = Map<object, Row>;

function resolveRef(ref: unknown, sides: Sides): unknown {
  if (isParam(ref)) return ref.value;
  if (isColumn(ref)) return sides.get(ref.table)?.[keyOf(ref)];
  throw new Error(`fake-content-db: unsupported SQL reference ${String(ref)}`);
}

function evalEq(cond: unknown, sides: Sides): boolean {
  const refs = eqRefs(cond);
  if (!refs) throw new Error("fake-content-db: only eq() conditions are supported");
  return resolveRef(refs.left, sides) === resolveRef(refs.right, sides);
}

function sortSpec(expr: unknown): { key: string; dir: "asc" | "desc" } | null {
  const chunks = (expr as { queryChunks?: unknown[] } | null)?.queryChunks;
  if (!Array.isArray(chunks)) return null;
  const col = chunks.find((c) => isColumn(c));
  if (!col) return null;
  const text = chunks
    .filter((c) => (c as { constructor?: { name?: string } })?.constructor?.name === "StringChunk")
    .map((c) => String((c as { value: string }).value))
    .join("");
  return { key: keyOf(col), dir: text.includes("desc") ? "desc" : "asc" };
}

interface QueryState {
  table: object;
  rows: Row[];
  joins: { table: object; rows: Row[]; cond: unknown }[];
  cols?: Record<string, unknown>;
  filters: unknown[];
  sortExpr: unknown;
  limitN?: number;
}

function sideMap(sides: { table: object; row: Row }[]): Sides {
  const map: Sides = new Map();
  for (const s of sides) map.set(s.table, s.row);
  return map;
}

function project(state: QueryState, candidates: { table: object; row: Row }[][]): Row[] {
  if (state.cols) {
    return candidates.map((sides) => {
      const out: Row = {};
      const map = sideMap(sides);
      for (const [outKey, col] of Object.entries(state.cols as Record<string, unknown>)) {
        out[outKey] = resolveRef(col, map);
      }
      return out;
    });
  }
  if (state.joins.length === 0) {
    return candidates.map((sides) => ({ ...sides[0].row }));
  }
  // Whole-table join selects nest under the table name (drizzle behavior —
  // getLessonFull reads row.content_lessons.id).
  return candidates.map((sides) => {
    const out: Row = {};
    for (const s of sides) out[tableName(s.table)] = { ...s.row };
    return out;
  });
}

function materialize(state: QueryState): Row[] {
  let candidates = state.rows.map((row) => [{ table: state.table, row }]);
  for (const j of state.joins) {
    const next: { table: object; row: Row }[][] = [];
    for (const sides of candidates) {
      for (const row of j.rows) {
        const merged = sideMap([...sides, { table: j.table, row }]);
        if (evalEq(j.cond, merged)) next.push([...sides, { table: j.table, row }]);
      }
    }
    candidates = next;
  }
  candidates = candidates.filter((sides) => {
    const map = sideMap(sides);
    return state.filters.every((cond) => evalEq(cond, map));
  });
  const spec = sortSpec(state.sortExpr);
  if (spec) {
    candidates = [...candidates].sort((a, b) => {
      const av = sideMap(a).get(state.table)?.[spec.key];
      const bv = sideMap(b).get(state.table)?.[spec.key];
      let result: number;
      if (typeof av === "number" && typeof bv === "number") {
        result = av - bv;
      } else {
        const as = String(av ?? "");
        const bs = String(bv ?? "");
        result = as < bs ? -1 : as > bs ? 1 : 0;
      }
      return spec.dir === "asc" ? result : -result;
    });
  }
  if (state.limitN != null) candidates = candidates.slice(0, state.limitN);
  return project(state, candidates);
}

function makeQuery(state: QueryState): unknown {
  const promise = Promise.resolve().then(() => materialize(state));
  return Object.assign(promise, {
    where: (cond: unknown) => makeQuery({ ...state, filters: [...state.filters, cond] }),
    orderBy: (expr: unknown) => makeQuery({ ...state, sortExpr: expr }),
    limit: (n: number) => makeQuery({ ...state, limitN: n }),
    innerJoin: (table: object, cond: unknown) =>
      makeQuery({
        ...state,
        joins: [...state.joins, { table, rows: [...(tables.get(table) ?? [])], cond }],
      }),
  });
}

function applyDefaults(table: object, vals: Row): Row {
  const row: Row = {};
  for (const [key, col] of columnEntries(table)) {
    const provided = vals[key];
    if (provided !== undefined) {
      row[key] = provided;
      continue;
    }
    const def = (col as { default?: unknown }).default;
    const defaultFn = (col as { defaultFn?: () => unknown }).defaultFn;
    if (typeof defaultFn === "function") {
      row[key] = defaultFn();
    } else if (def !== undefined && def !== null) {
      // defaultNow() and friends are drizzle SQL objects, not literal values.
      const isSql = typeof def === "object" && "queryChunks" in (def as object);
      row[key] = isSql ? (key.endsWith("At") ? new Date() : null) : def;
    } else {
      row[key] = null;
    }
  }
  for (const [key, value] of Object.entries(vals)) {
    if (value !== undefined) row[key] = value;
  }
  return row;
}

function cloneRow(row: Row): Row {
  return { ...row };
}

interface CascadeSpec {
  child: object;
  fkKey: string;
}

// Postgres ON DELETE CASCADE equivalents: deleteUnit/deleteLesson rely on the
// real FK cascades, so the fake must mirror them (recursively).
const cascades = new Map<object, CascadeSpec[]>();

export function registerCascade(parent: object, child: object, childFkKey: string): void {
  const list = cascades.get(parent) ?? [];
  list.push({ child, fkKey: childFkKey });
  cascades.set(parent, list);
}

function deleteMatching(table: object, pred: (row: Row) => boolean): Row[] {
  const store = tables.get(table) ?? [];
  const keep: Row[] = [];
  const removed: Row[] = [];
  for (const row of store) (pred(row) ? removed : keep).push(row);
  tables.set(table, keep);
  for (const spec of cascades.get(table) ?? []) {
    for (const row of removed) {
      deleteMatching(spec.child, (childRow) => childRow[spec.fkKey] === row.id);
    }
  }
  return removed;
}

// Structural type of the fake db (also breaks the self-referential inference
// the transaction method would otherwise cause inside makeFakeContentDb).
export interface FakeContentDb {
  select(cols?: Record<string, unknown>): { from(table: object): unknown };
  insert(table: object): { values(vals: Row): { returning(): Promise<Row[]> } };
  update(table: object): {
    set(vals: Row): { where(cond: unknown): Promise<Row[]> & { returning(): Promise<Row[]> } };
  };
  delete(table: object): { where(cond: unknown): Promise<Row[]> };
  transaction<T>(cb: (tx: FakeContentDb) => Promise<T>): Promise<T>;
}

export function makeFakeContentDb(): FakeContentDb {
  const db: FakeContentDb = {
    select(cols?: Record<string, unknown>) {
      return {
        from: (table: object) =>
          makeQuery({
            table,
            rows: [...(tables.get(table) ?? [])],
            joins: [],
            cols,
            filters: [],
            sortExpr: null,
          }),
      };
    },
    insert(table: object) {
      return {
        values: (vals: Row) => ({
          returning: async () => {
            const row = applyDefaults(table, vals);
            const store = tables.get(table) ?? [];
            store.push(row);
            tables.set(table, store);
            return [cloneRow(row)];
          },
        }),
      };
    },
    update(table: object) {
      return {
        set: (vals: Row) => ({
          where: (cond: unknown) => {
            const run = async () => {
              const updated: Row[] = [];
              for (const row of tables.get(table) ?? []) {
                if (!evalEq(cond, new Map([[table, row]]))) continue;
                for (const [key, value] of Object.entries(vals)) {
                  if (value !== undefined) row[key] = value;
                }
                updated.push(cloneRow(row));
              }
              return updated;
            };
            const promise = run();
            return Object.assign(promise, { returning: () => promise });
          },
        }),
      };
    },
    delete(table: object) {
      return {
        where: async (cond: unknown) => {
          deleteMatching(table, (row) => evalEq(cond, new Map([[table, row]])));
          return [];
        },
      };
    },
    async transaction<T>(cb: (tx: FakeContentDb) => Promise<T>): Promise<T> {
      return cb(db);
    },
  };
  return db;
}

/** Replace a table's rows (tests seed the `user` table this way). */
export function seedFakeTable(table: object, rows: Row[]): void {
  tables.set(
    table,
    rows.map((r) => ({ ...r })),
  );
}

/** Read current rows for assertions (copies). */
export function readFakeTable(table: object): Row[] {
  return (tables.get(table) ?? []).map(cloneRow);
}

export function resetFakeDb(): void {
  tables.clear();
}
