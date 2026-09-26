import { createAuthClient } from "better-auth/react";
import { env } from "#/libs/env.ts";

export const authClient = createAuthClient({
  baseURL: env.apiOrigin,
});

export type AuthUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>["user"];

export function translateAuthError(
  error?: { message?: string; code?: string } | null,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): string {
  if (!error) return fallback;

  const msg = error.message?.toLowerCase() ?? "";
  const code = error.code?.toUpperCase() ?? "";

  if (
    code === "USER_ALREADY_EXISTS" ||
    msg.includes("already exists") ||
    msg.includes("user already exists")
  ) {
    return "Email sudah terdaftar. Gunakan email lain atau silakan masuk.";
  }

  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    msg.includes("invalid email or password") ||
    msg.includes("invalid credentials")
  ) {
    return "Email atau kata sandi salah.";
  }

  if (msg.includes("invalid email")) {
    return "Format email tidak valid.";
  }

  if (msg.includes("password") && msg.includes("short")) {
    return "Kata sandi terlalu pendek.";
  }

  if (code === "INVALID_TOKEN" || msg.includes("token") || msg.includes("expired")) {
    return "Tautan tidak valid atau sudah kedaluwarsa.";
  }

  return error.message || fallback;
}
