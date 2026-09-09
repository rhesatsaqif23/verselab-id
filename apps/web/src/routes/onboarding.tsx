// Onboarding layout route — guards the onboarding flow behind an
// authenticated, not-yet-onboarded session.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { resolveSession } from "#/libs/session.ts";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const session = await resolveSession();
    if (session.status === "anonymous") {
      throw redirect({ to: "/login" });
    }
    if (session.onboarded) {
      throw redirect({ to: "/" });
    }
    return { session };
  },
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return <Outlet />;
}
