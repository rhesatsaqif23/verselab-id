// Tests for the onboarding submit hook: daily-goal seeding, idempotent
// PROFILE_ALREADY_EXISTS redirect, and generic failure handling.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, renderHook } from "@testing-library/react";
import { useOnboarding } from "#/features/onboarding/hook/use-onboarding.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { resetProgress } from "../home/test-utils.tsx";

const { navigateMock, submitOnboardingMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  submitOnboardingMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("#/features/onboarding/api.ts", () => ({
  submitOnboarding: submitOnboardingMock,
  PROFILE_ALREADY_EXISTS: "PROFILE_ALREADY_EXISTS",
  ONBOARDING_FAILED: "ONBOARDING_FAILED",
}));

const values = {
  displayName: "Budi",
  startUnitId: "keuangan" as const,
  dailyGoal: "serious" as const,
};

const profile = (dailyGoal: string) => ({
  userId: "u-1",
  displayName: "Budi",
  startUnitId: "keuangan",
  dailyGoal,
  onboardedAt: "2026-09-12T00:00:00.000Z",
});

beforeEach(() => {
  resetProgress();
  navigateMock.mockReset();
  submitOnboardingMock.mockReset();
});

describe("useOnboarding", () => {
  it("seeds the daily-goal minutes and navigates to the welcome screen", async () => {
    submitOnboardingMock.mockResolvedValue({ profile: profile("serious") });

    const { result } = renderHook(() => useOnboarding());
    await act(async () => {
      await result.current.submit(values);
    });

    expect(useProgressStore.getState().dailyGoalMinutes).toBe(20);
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/onboarding/welcome",
      state: { displayName: "Budi", startUnitId: "keuangan", purpose: "lainnya" },
    });
    expect(result.current.error).toBeNull();
  });

  it("maps a stale goal option to its minutes (casual -> 5)", async () => {
    submitOnboardingMock.mockResolvedValue({ profile: profile("casual") });

    const { result } = renderHook(() => useOnboarding());
    await act(async () => {
      await result.current.submit(values);
    });

    expect(useProgressStore.getState().dailyGoalMinutes).toBe(5);
  });

  it("redirects home when the profile already exists", async () => {
    submitOnboardingMock.mockRejectedValue(new Error("PROFILE_ALREADY_EXISTS"));

    const { result } = renderHook(() => useOnboarding());
    await act(async () => {
      await result.current.submit(values);
    });

    expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
    expect(result.current.error).toBeNull();
  });

  it("shows the generic error for any other failure", async () => {
    submitOnboardingMock.mockRejectedValue(new Error("network timeout"));

    const { result } = renderHook(() => useOnboarding());
    await act(async () => {
      await result.current.submit(values);
    });

    expect(navigateMock).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Gagal menyimpan profil. Silakan coba lagi.");
  });
});
