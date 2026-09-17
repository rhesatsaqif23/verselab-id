// useOnboarding: orchestrates submitting the learning profile, seeding the
// local daily-goal minutes, and navigating to the welcome screen.
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProgressStore, type DailyGoalMinutes } from "#/engine/progress/progressStore.ts";
import { dailyGoalToMinutes, type OnboardingInput } from "@verselab/shared/schemas/profile";
import { putProgress } from "#/libs/api.ts";
import { PROFILE_ALREADY_EXISTS, submitOnboarding } from "../api.ts";
import type { OnboardingState } from "../types.ts";

export function useOnboarding() {
  const navigate = useNavigate();
  const setDailyGoal = useProgressStore((s) => s.setDailyGoal);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(values: OnboardingInput) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitOnboarding({ data: values });
      const minutes = dailyGoalToMinutes[result.profile.dailyGoal] as DailyGoalMinutes;
      setDailyGoal(minutes);
      await putProgress({
        data: {
          xp: 0,
          streak: 0,
          streakFreeze: 0,
          lastActiveDate: null,
          completedLessons: [],
        },
      });
      const state: OnboardingState = {
        displayName: values.displayName,
        startUnitId: values.startUnitId,
        purpose: values.purpose ?? "lainnya",
      };
      await navigate({ to: "/onboarding/welcome", state: state as never });
    } catch (err: unknown) {
      console.error("[onboarding] submit failed:", err);
      const asObj = typeof err === "object" && err !== null ? err : null;
      const code = asObj && "code" in asObj ? String((asObj as { code: unknown }).code) : undefined;
      if (code === PROFILE_ALREADY_EXISTS) {
        await navigate({ to: "/home" });
        return;
      }
      if (code && asObj && "message" in asObj) {
        setError(String((asObj as { message: unknown }).message));
        return;
      }
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
