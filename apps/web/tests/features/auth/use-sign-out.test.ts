// useSignOut: mirrored test — sign-out clears the Better Auth session (both
// relayed cookies are dropped by the browser) and the user lands on the guest
// landing page. Sign-out is a direct browser→API call, so an API failure is
// surfaceable to the UI and NOT swallowed here (unlike resolveSession's SSR
// path, which degrades to anonymous).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSignOut } from "#/features/auth/hooks/useSignOut.ts";

const { signOutMock, navigateMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  navigateMock: vi.fn(),
}));

vi.mock("#/libs/auth-client.ts", () => ({ authClient: { signOut: signOutMock } }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigateMock }));

beforeEach(() => {
  signOutMock.mockReset();
  navigateMock.mockReset();
});

describe("useSignOut", () => {
  it("signs out then navigates to the landing page", async () => {
    signOutMock.mockResolvedValue({ data: null });
    const { result } = renderHook(() => useSignOut());

    await act(async () => {
      await result.current.signOut();
    });

    expect(signOutMock).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
    expect(result.current.pending).toBe(false);
  });
});
