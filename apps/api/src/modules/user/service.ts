import type { User } from "better-auth/types";
import type { Profile } from "@verselab/shared/schemas/profile";
import { eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { userProfiles } from "../../database/schema.ts";

export type UserService = {
  getMe: (user: User) => Promise<{ user: User; profile: Profile | null }>;
};

function toProfile(row: typeof userProfiles.$inferSelect): Profile | null {
  return {
    userId: row.userId,
    displayName: row.displayName ?? "",
    startUnitId: (row.startUnitId ?? "keuangan") as Profile["startUnitId"],
    dailyGoal: row.dailyGoal ?? "regular",
    purpose: (row.purpose ?? "lainnya") as Profile["purpose"],
    onboardedAt: row.onboardedAt ? row.onboardedAt.toISOString() : null,
  };
}

export const userService: UserService = {
  async getMe(user) {
    const [profileRow] = await getDb()
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    return { user, profile: profileRow ? toProfile(profileRow) : null };
  },
};
