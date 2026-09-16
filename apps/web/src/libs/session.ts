import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Profile } from "@verselab/shared/schemas/profile";
import { authClient, type AuthUser } from "#/libs/auth-client.ts";
import { relayRequest } from "#/libs/relay.ts";

async function fetchProfile(): Promise<Profile | null> {
  const res = await relayRequest("/v1/user/me");
  if (!res.ok) return null;
  const body = (await res.json()) as { data?: { profile?: Profile | null } };
  return body.data?.profile ?? null;
}

export type SessionDeps = {
  getSession: () => Promise<{ data?: { user: AuthUser | null } | null }>;
  fetchProfile: () => Promise<Profile | null>;
};

/**
 * Core session resolution, dependency-injected so the SSR wrapper stays thin and
 * the failure mode (API down, relay broken) is unit-testable without the Start
 * runtime. Never throws: every failure degrades to `anonymous`, so a guarded
 * route falls back to the guest/login state instead of a 500.
 */
export async function resolveSessionCore(deps: SessionDeps): Promise<ResolvedSession> {
  try {
    const result = await deps.getSession();
    if (!result.data?.user) return { status: "anonymous" as const };
    const profile = await deps.fetchProfile();
    return {
      status: "authenticated" as const,
      user: result.data.user,
      profile,
      onboarded: profile?.onboardedAt != null,
    };
  } catch {
    return { status: "anonymous" as const };
  }
}

export const resolveSession = createServerFn({ method: "GET" }).handler(async () => {
  return resolveSessionCore({
    getSession: () => authClient.getSession({ fetchOptions: { headers: getRequestHeaders() } }),
    fetchProfile,
  });
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
    throw redirect({ to: session.onboarded ? "/home" : "/onboarding" });
  }
}

export type ResolvedSession =
  | { status: "anonymous" }
  | {
      status: "authenticated";
      user: AuthUser;
      profile: Profile | null;
      onboarded: boolean;
    };
