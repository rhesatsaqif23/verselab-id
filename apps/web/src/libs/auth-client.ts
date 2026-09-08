import { createAuthClient } from "better-auth/react";
import { env } from "#/libs/env.ts";

export const authClient = createAuthClient({
  baseURL: env.apiOrigin,
});

export type AuthUser = NonNullable<Awaited<ReturnType<typeof authClient.getSession>>["data"]>["user"];
