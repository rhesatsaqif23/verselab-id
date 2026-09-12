// Register route — delegates rendering to the auth feature. Authenticated users
// (inverse guard) are sent to the dashboard or onboarding instead.
import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "#/features/auth/RegisterPage.tsx";
import { redirectIfAuthenticated, resolveSession } from "#/libs/session.ts";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => redirectIfAuthenticated(await resolveSession()),
  component: RegisterPage,
});
