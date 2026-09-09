// Register route — delegates rendering to the auth feature.
import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "#/features/auth/RegisterPage.tsx";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
