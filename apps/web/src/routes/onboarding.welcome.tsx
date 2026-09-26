// Onboarding welcome route — celebratory screen shown after submitting the
// profile. Requires the displayName + startUnitId navigation state.
import { createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { OnboardingWelcome } from "#/features/onboarding/components/OnboardingWelcome.tsx";
import type { OnboardingState } from "#/features/onboarding/types.ts";

export const Route = createFileRoute("/onboarding/welcome")({
  beforeLoad: ({ location }) => {
    const state = location.state as unknown as OnboardingState | undefined;
    if (!state?.displayName || !state.startUnitId) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: OnboardingWelcomeRouteComponent,
});

function OnboardingWelcomeRouteComponent() {
  const state = useRouterState({
    select: (s) => s.location.state as unknown as OnboardingState | undefined,
  });
  if (!state?.displayName || !state.startUnitId) return null;
  return <OnboardingWelcome state={state} />;
}
