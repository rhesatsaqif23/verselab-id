import { Elysia } from "elysia";
import { auth } from "../auth/index.ts";

export const authContext = new Elysia({ name: "auth-context" }).macro({
  auth: {
    async resolve({ status, request }) {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session) return status(401);
      return { user: session.user, session: session.session };
    },
  },
});