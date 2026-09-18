import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "#/libs/env.ts";
import { mapUnit, mapLesson } from "#/libs/content-mapper.ts";
import type { Unit, Lesson } from "#/engine/types.ts";

type ApiOk<T> = { ok: true; data: T };
type ApiFail = { ok: false; error: { code: string; message: string } };
type ApiResponse<T> = ApiOk<T> | ApiFail;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const url = `${env.apiOrigin.replace(/localhost/, "127.0.0.1")}${path}`;
    const headers = new Headers({ accept: "application/json" });
    const cookie = getRequestHeaders().get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiResponse<T>;
    return body.ok ? body.data : null;
  } catch {
    return null;
  }
}

// ── Raw DB types (internal) ─────────────────────────────────────────────────

type RawUnit = {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

type RawLesson = {
  id: string;
  unitId: string;
  title: string;
  slug?: string;
  icon: string | null;
  prerequisite: string | null;
  sortOrder: number;
};

type RawScreen = {
  id: string;
  lessonId: string;
  type: "concept" | "choice" | "numeric" | "allocation";
  slug?: string;
  prompt: string;
  explain: string;
  options: { id: string; label: string }[] | null;
  correctId: string | null;
  numericUnit: string | null;
  acceptRangeMin: number | null;
  acceptRangeMax: number | null;
  categories: string[] | null;
  rule: { type: string; categoryId: string; min?: number; max?: number } | null;
  sortOrder: number;
};

type RawLessonWithScreens = RawLesson & { screens: RawScreen[] };

type RawUnitWithContent = RawUnit & {
  lessons: (RawLesson & { screens: RawScreen[] })[];
};

// ── Public server functions (return engine types) ────────────────────────────

export const getUnits = createServerFn({ method: "GET" }).handler(async () => {
  const data = await apiFetch<RawUnit[]>("/v1/content/units");
  return (data ?? []).map((u) => mapUnit({ ...u, lessons: [] }));
});

export const getUnit = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<Unit | null> => {
    const raw = await apiFetch<RawUnit>(`/v1/content/units/${id}`);
    if (!raw) return null;
    return mapUnit({ ...raw, lessons: [] });
  });

export const getLesson = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<Lesson | null> => {
    const raw = await apiFetch<RawLessonWithScreens>(`/v1/content/lessons/${id}`);
    if (!raw) return null;
    return mapLesson(raw);
  });

export const getAllUnits = createServerFn({ method: "GET" }).handler(async () => {
  const data = await apiFetch<RawUnitWithContent[]>("/v1/content/units-with-content");
  return (data ?? []).map(mapUnit);
});
