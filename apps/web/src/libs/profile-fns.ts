// Server functions for profile updates (name, avatar, daily goal).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { relayRequest } from "#/libs/relay.ts";
import { resolveSession } from "#/libs/session.ts";

export const updateProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      displayName: z.string().trim().min(1).max(50).optional(),
      dailyGoal: z.enum(["casual", "regular", "serious"]).optional(),
      avatarUrl: z.string().url().nullable().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await relayRequest("/v1/user/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message ?? "Gagal menyimpan profil");
    }
    return resolveSession();
  });

export const uploadAvatar = createServerFn({ method: "POST" })
  .validator(z.object({ base64: z.string(), filename: z.string() }))
  .handler(async ({ data }) => {
    const { base64, filename } = data;
    const binary = atob(base64.split(",")[1] ?? base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = filename.endsWith(".png") ? "png" : "jpg";
    const blob = new Blob([bytes], { type: ext === "png" ? "image/png" : "image/jpeg" });
    const file = new File([blob], filename, { type: blob.type });

    const form = new FormData();
    form.append("file", file);
    const res = await relayRequest("/v1/user/me/avatar", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message ?? "Gagal mengunggah avatar");
    }
    const body = (await res.json()) as { data: { avatarUrl: string } };
    return body.data.avatarUrl;
  });
