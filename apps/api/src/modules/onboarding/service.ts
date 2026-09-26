import type { OnboardingInput, Profile } from "@verselab/shared/schemas/profile";
import { eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { userProfiles } from "../../database/schema.ts";
import { appError } from "../../libs/errors.ts";

export type OnboardingService = {
  createOnboardingProfile: (userId: string, input: OnboardingInput) => Promise<Profile>;
};

function toProfile(row: typeof userProfiles.$inferSelect): Profile {
  return {
    userId: row.userId,
    displayName: row.displayName ?? "",
    startUnitId: (row.startUnitId ?? "keuangan") as Profile["startUnitId"],
    dailyGoal: row.dailyGoal ?? "regular",
    purpose: (row.purpose ?? "lainnya") as Profile["purpose"],
    onboardedAt: row.onboardedAt ? row.onboardedAt.toISOString() : null,
  };
}

export const onboardingService: OnboardingService = {
  async createOnboardingProfile(userId, input) {
    const db = getDb();

    const existing = await db
      .select({ userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      throw appError({ code: "PROFILE_ALREADY_EXISTS" });
    }

    const [row] = await db
      .insert(userProfiles)
      .values({
        userId,
        displayName: input.displayName,
        startUnitId: input.startUnitId,
        dailyGoal: input.dailyGoal,
        purpose: input.purpose,
        onboardedAt: new Date(),
      })
      .returning();

    return toProfile(row);
  },
};
