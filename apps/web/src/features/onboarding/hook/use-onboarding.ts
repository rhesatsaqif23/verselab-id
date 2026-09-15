// useOnboarding: orchestrates submitting the learning profile, seeding the
// local daily-goal minutes, and navigating to the welcome screen.
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useProgressStore, type DailyGoalMinutes } from "#/engine/progress/progressStore.ts";
import { dailyGoalToMinutes, type OnboardingInput } from "@verselab/shared/schemas/profile";
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
      const state: OnboardingState = {
        displayName: values.displayName,
        startUnitId: values.startUnitId,
      };
      await navigate({ to: "/onboarding/welcome", state: state as never });
    } catch (err) {
      // Already onboarded (stale tab / double submit): take the user home.
      if (err instanceof Error && err.message === PROFILE_ALREADY_EXISTS) {
        await navigate({ to: "/" });
        return;
      }
      setError("Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
