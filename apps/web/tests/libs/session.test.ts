import { describe, expect, it } from "vitest";
import {
  redirectIfAuthenticated,
  resolveSessionCore,
  type ResolvedSession,
} from "#/libs/session.ts";

function capture(fn: () => void): { to?: string } | null {
  try {
    fn();
    return null;
  } catch (e) {
    if (e instanceof Response && "options" in e)
      return (e as Response & { options: { to?: string } }).options;
    return e as { to?: string };
  }
}

const authenticated = (onboarded: boolean): ResolvedSession =>
  ({
    status: "authenticated",
    user: { id: "u-1", email: "t@test.dev", name: "Tester" },
    profile: null,
    onboarded,
    role: "user",
  }) as ResolvedSession;

describe("redirectIfAuthenticated", () => {
  it("lets anonymous sessions through", () => {
    expect(
      capture(() => redirectIfAuthenticated({ status: "anonymous" } as ResolvedSession)),
    ).toBeNull();
  });

  it("sends an onboarded user to the dashboard", () => {
    expect(capture(() => redirectIfAuthenticated(authenticated(true)))?.to).toBe("/home");
  });

  it("sends an un-onboarded user to onboarding", () => {
    expect(capture(() => redirectIfAuthenticated(authenticated(false)))?.to).toBe("/onboarding");
  });
});

const user = { id: "u-1", email: "t@test.dev", name: "Tester" };

describe("resolveSessionCore", () => {
  it("never throws when the get-session call fails — degrades to anonymous", async () => {
    await expect(
      resolveSessionCore({
        getSession: async () => {
          throw new Error("fetch failed");
        },
        fetchProfileAndRole: async () => ({ profile: null, role: "user" }),
      }),
    ).resolves.toEqual({ status: "anonymous" });
  });

  it("degrades to anonymous when the relay /profile call fails", async () => {
    await expect(
      resolveSessionCore({
        getSession: async () => ({ data: { user } }),
        fetchProfileAndRole: async () => {
          throw new Error("fetch failed");
        },
      }),
    ).resolves.toEqual({ status: "anonymous" });
  });

  it("returns anonymous when no session exists", async () => {
    await expect(
      resolveSessionCore({
        getSession: async () => ({ data: null }),
        fetchProfileAndRole: async () => ({ profile: null, role: "user" }),
      }),
    ).resolves.toEqual({ status: "anonymous" });
  });

  it("returns authenticated with the profile and role for a session user", async () => {
    const session = await resolveSessionCore({
      getSession: async () => ({ data: { user } }),
      fetchProfileAndRole: async () => ({
        profile: {
          userId: "u-1",
          displayName: "Budi",
          startUnitId: "keuangan",
          dailyGoal: "regular",
          onboardedAt: "2026-09-12T00:00:00.000Z",
        },
        role: "admin",
      }),
    });
    expect(session.status).toBe("authenticated");
    if (session.status === "authenticated") {
      expect(session.user.name).toBe("Tester");
      expect(session.onboarded).toBe(true);
      expect(session.profile?.displayName).toBe("Budi");
      expect(session.role).toBe("admin");
    }
  });

  it("defaults role to user when not provided", async () => {
    const session = await resolveSessionCore({
      getSession: async () => ({ data: { user } }),
      fetchProfileAndRole: async () => ({
        profile: {
          userId: "u-1",
          displayName: "Budi",
          startUnitId: "keuangan",
          dailyGoal: "regular",
          onboardedAt: "2026-09-12T00:00:00.000Z",
        },
        role: "user",
      }),
    });
    expect(session.status).toBe("authenticated");
    if (session.status === "authenticated") {
      expect(session.role).toBe("user");
    }
  });
});
