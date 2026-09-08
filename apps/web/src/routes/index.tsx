// Landing page route — delegates rendering to the feature module.
import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "#/features/landing/index.tsx";

export const Route = createFileRoute("/")({
  component: LandingPage,
});
