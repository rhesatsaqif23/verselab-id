import { Elysia } from "elysia";
import { eq } from "drizzle-orm";
import { getDb } from "../database/index.ts";
import { user } from "../database/auth-schema.ts";
import { appError } from "../libs/errors.ts";

export const requireAdmin = new Elysia({ name: "require-admin" }).macro({
  admin: {
    async resolve({ status, request }) {
      try {
        const session = await import("../auth/index.ts").then((m) =>
          m.auth.api.getSession({ headers: request.headers }),
        );
        if (!session) return status(401);

        const [row] = await getDb()
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);

        if (!row || row.role !== "admin") {
          throw appError({ code: "FORBIDDEN" });
        }

        return { user: session.user, session: session.session };
      } catch (err) {
        if (err instanceof Error && err.name === "AppError") throw err;
        console.error("[rbac] requireAdmin failed:", err);
        return status(401);
      }
    },
  },
});
