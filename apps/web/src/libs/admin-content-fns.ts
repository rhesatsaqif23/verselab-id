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

async function apiMutate<T>(path: string, init: RequestInit): Promise<T> {
  const res = await relayRequest(path, init);
  if (!res.ok) {
    // Surface fail envelopes ("CODE: message") so callers can translate them.
    // Unreadable bodies fall back to the HTTP status.
    let body: ApiResponse<T> | null = null;
    try {
      body = (await res.json()) as ApiResponse<T>;
    } catch {
      body = null;
    }
    if (body && !body.ok) throw new Error(`${body.error.code}: ${body.error.message}`);
    // Elysia answers unknown routes with an empty-body 404 (no fail envelope).
    // That means the running API predates the endpoint — not a deleted row.
    if (res.status === 404) throw new Error("ROUTE_NOT_FOUND");
    throw new Error(`HTTP ${res.status}`);
  }
  const body = (await res.json()) as ApiResponse<T>;
  if (!body.ok) throw new Error(`${body.error.code}: ${body.error.message}`);
  return body.data;
}

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminUnit = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminLesson = {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  prerequisiteIds: string[] | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

// ── Unit CRUD ──────────────────────────────────────────────────────────────

export const adminGetUnits = createServerFn({ method: "GET" }).handler(async () => {
  return apiCall<AdminUnit[]>("/v1/content/units") ?? [];
});

export const adminGetUnitBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return apiCall<AdminUnit>(`/v1/content/units-by-slug/${encodeURIComponent(data.slug)}`);
  });

export const adminCreateUnit = createServerFn({ method: "POST" })
  .validator(
    (data: { id?: string; title: string; description?: string; imageUrl?: string }) => data,
  )
  .handler(async ({ data }) => {
    return apiMutate<AdminUnit>("/v1/content/units", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

export const adminUpdateUnit = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; title?: string; description?: string; imageUrl?: string | null }) => data,
  )
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
  .validator((data: { id: string; file: string; filename: string; fileType: string }) => data)
  .handler(async ({ data }) => {
    const binary = atob(data.file);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: data.fileType });
    const file = new File([blob], data.filename, { type: data.fileType });
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

export const adminGetLessonBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return apiCall<AdminLesson>(`/v1/content/lessons-by-slug/${encodeURIComponent(data.slug)}`);
  });

export const adminCreateLesson = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string;
      unitId: string;
      title: string;
      description?: string;
      icon?: string;
      prerequisiteIds?: string[];
    }) => data,
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
    (data: {
      id: string;
      title?: string;
      description?: string | null;
      icon?: string;
      imageUrl?: string | null;
      prerequisiteIds?: string[] | null;
    }) => data,
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

export const adminUploadLessonImage = createServerFn({ method: "POST" })
  .validator((data: { id: string; file: string; filename: string; fileType: string }) => data)
  .handler(async ({ data }) => {
    const binary = atob(data.file);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: data.fileType });
    const file = new File([blob], data.filename, { type: data.fileType });
    const form = new FormData();
    form.append("file", file);
    return apiMutate<{ imageUrl: string }>(`/v1/content/lessons/${data.id}/image`, {
      method: "POST",
      body: form,
    });
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

// ── Screen CRUD ────────────────────────────────────────────────────────────

export type AdminScreen = {
  id: string;
  lessonId: string;
  type: "concept" | "choice" | "numeric" | "allocation";
  slug: string;
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
  createdAt: string;
  updatedAt: string;
};

export const adminGetScreens = createServerFn({ method: "GET" })
  .validator((data: { lessonId: string }) => data)
  .handler(async ({ data }) => {
    return apiCall<AdminScreen[]>(`/v1/content/lessons/${data.lessonId}/screens`) ?? [];
  });

// ── List-all endpoints ─────────────────────────────────────────────────────

export type AdminLessonWithUnit = AdminLesson & { unitTitle: string; unitSlug: string };

export const adminGetAllLessons = createServerFn({ method: "GET" }).handler(async () => {
  return apiCall<AdminLessonWithUnit[]>("/v1/content/lessons-all") ?? [];
});

export type AdminScreenWithLesson = AdminScreen & {
  lessonTitle: string;
  unitId: string;
  unitSlug: string;
  lessonSlug: string;
};

export const adminGetAllScreens = createServerFn({ method: "GET" }).handler(async () => {
  return apiCall<AdminScreenWithLesson[]>("/v1/content/screens-all") ?? [];
});

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  displayName: string | null;
  avatarUrl: string | null;
  onboardedAt: Date | null;
};

export const adminGetUsers = createServerFn({ method: "GET" }).handler(async () => {
  return apiCall<AdminUser[]>("/v1/user/all") ?? [];
});

export const adminCreateScreen = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id?: string;
      lessonId: string;
      type: "concept" | "choice" | "numeric" | "allocation";
      prompt: string;
      explain: string;
      options?: { id: string; label: string }[];
      correctId?: string;
      numericUnit?: string;
      acceptRangeMin?: number;
      acceptRangeMax?: number;
      categories?: string[];
      rule?: { type: string; categoryId: string; min?: number; max?: number };
    }) => data,
  )
  .handler(async ({ data }) => {
    return apiMutate<AdminScreen>("/v1/content/screens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

export const adminUpdateScreen = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      prompt?: string;
      explain?: string;
      options?: { id: string; label: string }[] | null;
      correctId?: string | null;
      numericUnit?: string | null;
      acceptRangeMin?: number | null;
      acceptRangeMax?: number | null;
      categories?: string[] | null;
      rule?: { type: string; categoryId: string; min?: number; max?: number } | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { id, ...patch } = data;
    return apiMutate<AdminScreen>(`/v1/content/screens/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  });

export const adminDeleteScreen = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>(`/v1/content/screens/${data.id}`, { method: "DELETE" });
  });

export const adminReorderScreens = createServerFn({ method: "POST" })
  .validator((data: { ids: string[] }) => data)
  .handler(async ({ data }) => {
    return apiMutate<null>("/v1/content/screens/reorder", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
  });

// ── Error translation ────────────────────────────────────────────────────────
// Converts technical API errors (HTTP codes, English envelopes, network
// failures) into clear Indonesian messages for admin toasts.

export function translateAdminError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");

  // Unwrap fail envelopes ("CODE: message") from apiMutate.
  const envelope = raw.match(/^([A-Z_]+):\s*([\s\S]*)$/);
  const code = envelope?.[1] ?? "";
  const msg = envelope ? envelope[2].trim() : raw;

  if (/failed to fetch|fetch failed|network|timeout|aborted|load failed/i.test(raw)) {
    return "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.";
  }

  const key = `${code} ${msg}`;
  if (/ROUTE_NOT_FOUND/.test(key)) {
    return "Server tidak mengenali aksi ini. Pastikan API versi terbaru (restart dev server) lalu coba lagi.";
  }
  if (/401|UNAUTHENTICATED|unauthorized/i.test(key)) {
    return "Sesi berakhir. Silakan masuk ulang.";
  }
  if (/403|FORBIDDEN|forbidden/i.test(key)) {
    return "Akses ditolak. Hanya admin yang dapat melakukan ini.";
  }
  if (/404|NOT_FOUND|not found/i.test(key)) {
    return "Data tidak ditemukan. Mungkin sudah dihapus, muat ulang halaman.";
  }
  if (/409|already exists/i.test(key) && !/siklus|berputar/i.test(msg)) {
    return "Data sudah ada. Gunakan nama yang berbeda.";
  }
  if (/422|validation|VALIDATION/i.test(key)) {
    return "Data tidak valid. Periksa kembali isian form.";
  }
  if (/400|BAD_REQUEST|bad request/i.test(key)) {
    return "Data tidak valid. Periksa kembali isian.";
  }
  if (/500|INTERNAL|internal/i.test(key)) {
    return "Terjadi kesalahan server. Coba lagi nanti.";
  }
  if (/503|SERVICE_UNAVAILABLE|UNAVAILABLE|sibuk/i.test(key)) {
    return "Server sibuk. Coba lagi sebentar.";
  }
  // Unknown envelope codes: show the message without the technical prefix.
  if (envelope) return msg !== "" ? msg : fallback;
  if (raw.trim() !== "" && !raw.startsWith("HTTP")) return raw;
  return fallback;
}
