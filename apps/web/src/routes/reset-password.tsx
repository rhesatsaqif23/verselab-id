// Reset password route — reads the reset token from search params and
// delegates rendering to the auth feature.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordPage } from "#/features/auth/pages/ResetPasswordPage.tsx";

const searchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/forgot-password" });
    }
  },
  component: ResetPasswordRouteComponent,
});

function ResetPasswordRouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordPage token={token as string} />;
}
