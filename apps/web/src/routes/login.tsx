// Login route — delegates rendering to the auth feature.
import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "#/features/auth/LoginPage.tsx";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
