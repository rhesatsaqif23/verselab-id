// Admin flag for the layout chrome. The header and the mobile tab bar both
// need it, so it is one cached query instead of two resolveSession() calls.
import { useQuery } from "@tanstack/react-query";
import { resolveSession } from "#/libs/session.ts";

const SESSION_KEY = ["session"] as const;

export function useIsAdmin(): boolean {
  const { data } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => resolveSession(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data?.status === "authenticated" && data.role === "admin";
}
