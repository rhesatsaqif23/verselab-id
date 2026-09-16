import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "#/libs/env.ts";

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

export type ContentUnit = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentLesson = {
  id: string;
  unitId: string;
  title: string;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentScreen = {
  id: string;
  lessonId: string;
  type: "concept" | "choice" | "numeric" | "allocation";
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
  createdAt: Date;
  updatedAt: Date;
};

export type LessonWithScreens = ContentLesson & { screens: ContentScreen[] };

export const getUnits = createServerFn({ method: "GET" }).handler(async () => {
  return apiFetch<ContentUnit[]>("/v1/content/units") ?? [];
});

export const getUnit = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    return apiFetch<ContentUnit>(`/v1/content/units/${id}`);
  });

export const getLesson = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    return apiFetch<LessonWithScreens>(`/v1/content/lessons/${id}`);
  });
