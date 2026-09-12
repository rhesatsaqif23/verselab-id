// Login route — delegates rendering to the auth feature. Authenticated users
// (inverse guard) are sent to the dashboard or onboarding instead.
import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "#/features/auth/LoginPage.tsx";
import { redirectIfAuthenticated, resolveSession } from "#/libs/session.ts";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => redirectIfAuthenticated(await resolveSession()),
  component: LoginPage,
});
