// Onboarding index route — the learning-profile setup form.
import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "#/features/onboarding/index.tsx";

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
});
