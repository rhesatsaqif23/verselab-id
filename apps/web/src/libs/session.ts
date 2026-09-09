import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Profile } from "@verselab/shared/schemas/profile";
import { authClient } from "#/libs/auth-client.ts";
import { env } from "#/libs/env.ts";

async function fetchProfile(userId: string): Promise<Profile | null> {
  void userId;
  const headers = getRequestHeaders();
  const res = await fetch(`${env.apiOrigin}/v1/user/me`, {
    headers: { ...headers, accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: { profile?: Profile | null } };
  return body.data?.profile ?? null;
}

export const resolveSession = createServerFn({ method: "GET" }).handler(async () => {
  const result = await authClient.getSession({
    fetchOptions: { headers: getRequestHeaders() },
  });
  if (!result.data?.user) return { status: "anonymous" as const };
  const profile = await fetchProfile(result.data.user.id);
  return {
    status: "authenticated" as const,
    user: result.data.user,
    onboarded: profile?.onboardedAt != null,
  };
});

export const requireAuth = createServerFn({ method: "GET" }).handler(async () => {
  const s = await resolveSession();
  if (s.status === "anonymous") throw new Error("Unauthorized");
  return s;
});

export type ResolvedSession = Awaited<ReturnType<typeof resolveSession>>;
