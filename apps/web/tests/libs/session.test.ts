import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: () => ({}) }),
}));

import { redirectIfAuthenticated, type ResolvedSession } from "#/libs/session.ts";

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
    onboarded,
  }) as ResolvedSession;

describe("redirectIfAuthenticated", () => {
  it("lets anonymous sessions through", () => {
    expect(
      capture(() => redirectIfAuthenticated({ status: "anonymous" } as ResolvedSession)),
    ).toBeNull();
  });

  it("sends an onboarded user to the dashboard", () => {
    expect(capture(() => redirectIfAuthenticated(authenticated(true)))?.to).toBe("/");
  });

  it("sends an un-onboarded user to onboarding", () => {
    expect(capture(() => redirectIfAuthenticated(authenticated(false)))?.to).toBe("/onboarding");
  });
});
