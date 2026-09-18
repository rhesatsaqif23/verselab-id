// Server functions for calling the API. These run in the TanStack Start SSR
// runtime so cookies are forwarded via relayRequest.
import { createServerFn } from "@tanstack/react-start";
import type { ProgressPatch, ServerProgress } from "@verselab/shared/schemas/progress";
import { relayRequest } from "#/libs/relay.ts";

async function apiGet<T>(path: string): Promise<T> {
  const res = await relayRequest(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  const body = (await res.json()) as { ok: boolean; data: T };
  if (!body.ok) throw new Error(`GET ${path}: not ok`);
  return body.data;
}

async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const res = await relayRequest(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  const body = (await res.json()) as { ok: boolean; data: T };
  if (!body.ok) throw new Error(`PUT ${path}: not ok`);
  return body.data;
}

async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const res = await relayRequest(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  const body = (await res.json()) as { ok: boolean; data: T };
  if (!body.ok) throw new Error(`PATCH ${path}: not ok`);
  return body.data;
}

export const getProgress = createServerFn({ method: "GET" }).handler(async () => {
  return apiGet<ServerProgress>("/v1/progress");
});

export const putProgress = createServerFn({ method: "POST" })
  .validator((patch: ProgressPatch) => patch)
  .handler(async ({ data }) => {
    return apiPut<ServerProgress>("/v1/progress", data);
  });

export const updateDailyGoal = createServerFn({ method: "POST" })
  .validator((data: { minutes: number }) => data)
  .handler(async ({ data }) => {
    return apiPatch<ServerProgress>("/v1/progress/daily-goal", data);
  });
