import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Profile } from "@verselab/shared/schemas/profile";
import { authClient } from "#/libs/auth-client.ts";
import { relayRequest } from "#/libs/relay.ts";

async function fetchProfile(userId: string): Promise<Profile | null> {
  void userId;
  const res = await relayRequest("/v1/user/me");
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

/**
 * Inverse guard for auth surfaces (`/login`, `/register`): authenticated users
 * are sent to the dashboard, or to onboarding when no profile exists yet.
 * Takes the resolved session so it unit-tests without the router.
 */
export function redirectIfAuthenticated(session: ResolvedSession) {
  if (session.status === "authenticated") {
    throw redirect({ to: session.onboarded ? "/" : "/onboarding" });
  }
}

export type ResolvedSession = Awaited<ReturnType<typeof resolveSession>>;
