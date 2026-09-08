import { Elysia } from "elysia";
import { eq } from "drizzle-orm";
import { authContext } from "../../middleware/auth.ts";
import { getDb } from "../../database/index.ts";
import { userProfiles } from "../../database/schema.ts";
import { ok, fail } from "../../libs/response.ts";
import { onboardingSchema } from "@verselab/shared/schemas/profile";

export const onboarding = new Elysia({ prefix: "/onboarding" })
  .use(authContext)
  .post(
    "/",
    async ({ user: u, body }) => {
      const db = getDb();

      const existing = await db
        .select({ userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.userId, u.id))
        .limit(1);

      if (existing.length > 0) {
        return fail({ code: "PROFILE_ALREADY_EXISTS", message: "Profile already exists" });
      }

      const [profile] = await db
        .insert(userProfiles)
        .values({
          userId: u.id,
          displayName: body.displayName,
          startUnitId: body.startUnitId,
          dailyGoal: body.dailyGoal,
          onboardedAt: new Date(),
        })
        .returning();

      return ok({ user: u, profile });
    },
    {
      body: onboardingSchema,
      auth: true,
    },
  );