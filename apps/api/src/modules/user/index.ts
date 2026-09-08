import { Elysia } from "elysia";
import { authContext } from "../../middleware/auth.ts";
import { ok } from "../../libs/response.ts";

export const user = new Elysia({ prefix: "/user" })
  .use(authContext)
  .get(
    "/me",
    ({ user: u, session }) =>
      ok({ user: u, session: { expiresAt: session.expiresAt } }),
    { auth: true },
  );