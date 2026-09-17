// useSignOut: signs the user out and navigates back to the landing page.
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/libs/auth-client.ts";

export function useSignOut() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await authClient.signOut();
    } finally {
      setPending(false);
    }
    await navigate({ to: "/" });
  }

  return { signOut, pending };
}
