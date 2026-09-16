import { createServerFn } from "@tanstack/react-start";
import { relayRequest } from "#/libs/relay.ts";

type ApiOk<T> = { ok: true; data: T };
type ApiFail = { ok: false; error: { code: string; message: string } };
type ApiResponse<T> = ApiOk<T> | ApiFail;

async function apiCall<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await relayRequest(path, init);
    if (!res.ok) return null;
    const body = (await res.json()) as ApiResponse<T>;
    return body.ok ? body.data : null;
  } catch {
    return null;
  }
}

async function apiMutate<T>(path: string, init: RequestInit): Promise<ApiResponse<T> | null> {
  try {
    const res = await relayRequest(path, init);
    if (!res.ok) return { ok: false, error: { code: "HTTP_ERROR", message: String(res.status) } };
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminUnit = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminLesson = {
  id: string;
  unitId: string;
  title: string;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// ── Unit CRUD ──────────────────────────────────────────────────────────────

export const adminGetUnits = createServerFn({ method: "GET" }).handler(async () => {
  return apiCall<AdminUnit[]>("/v1/content/units") ?? [];
});

export const adminCreateUnit = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string; description?: string; imageUrl?: string }) => data)
  .handler(async ({ data }) => {
    return apiMutate<AdminUnit>("/v1/content/units", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

export const adminUpdateUnit = createServerFn({ method: "POST" })
  .validator((data: { id: string; title?: string; description?: string; imageUrl?: string }) => data)
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    return apiMutate<AdminUnit>(`/v1/content/units/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  });

export const adminDeleteUnit = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>(`/v1/content/units/${data.id}`, { method: "DELETE" });
  });

export const adminReorderUnits = createServerFn({ method: "POST" })
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>("/v1/content/units/reorder", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

export const adminUploadUnitImage = createServerFn({ method: "POST" })
  .validator((data: { id: string; file: string; filename: string }) => data)
  .handler(async ({ data }) => {
    const binary = atob(data.file);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "image/webp" });
    const file = new File([blob], data.filename, { type: "image/webp" });
    const form = new FormData();
    form.append("file", file);
    return apiMutate<{ imageUrl: string }>(`/v1/content/units/${data.id}/image`, {
      method: "POST",
      body: form,
    });
  });

// ── Lesson CRUD ────────────────────────────────────────────────────────────

export const adminGetLessons = createServerFn({ method: "GET" })
  .validator((data: { unitId: string }) => data)
  .handler(async ({ data }) => {
    return apiCall<AdminLesson[]>(`/v1/content/units/${data.unitId}/lessons`) ?? [];
  });

export const adminCreateLesson = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; unitId: string; title: string; icon?: string }) => data,
  )
  .handler(async ({ data }) => {
    return apiMutate<AdminLesson>("/v1/content/lessons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

export const adminUpdateLesson = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; title?: string; icon?: string }) => data,
  )
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    return apiMutate<AdminLesson>(`/v1/content/lessons/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  });

export const adminDeleteLesson = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>(`/v1/content/lessons/${data.id}`, { method: "DELETE" });
  });

export const adminReorderLessons = createServerFn({ method: "POST" })
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>("/v1/content/lessons/reorder", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });
