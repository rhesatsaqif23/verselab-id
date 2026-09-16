import { Elysia } from "elysia";
import { auth } from "../auth/index.ts";

export const authContext = new Elysia({ name: "auth-context" }).macro({
  auth: {
    async resolve({ status, request }) {
      try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return status(401);
        return { user: session.user, session: session.session };
      } catch (err) {
        console.error("[auth] getSession failed:", err);
        return status(401);
      }
    },
  },
});
