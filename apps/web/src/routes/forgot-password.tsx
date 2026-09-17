// Forgot password route — delegates rendering to the auth feature.
import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "#/features/auth/pages/ForgotPasswordPage.tsx";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});
