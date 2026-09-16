import type { User } from "better-auth/types";
import type { Profile, UpdateProfileInput } from "@verselab/shared/schemas/profile";
import { eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { userProfiles } from "../../database/schema.ts";

export type UserService = {
  getMe: (user: User) => Promise<{ user: User; profile: Profile | null }>;
  updateProfile: (userId: string, input: UpdateProfileInput) => Promise<Profile>;
  uploadAvatar: (userId: string, file: File) => Promise<{ avatarUrl: string }>;
};

function toProfile(row: typeof userProfiles.$inferSelect): Profile {
  return {
    userId: row.userId,
    displayName: row.displayName ?? "",
    avatarUrl: row.avatarUrl ?? null,
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

  async updateProfile(userId, input) {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!existing) {
      throw new Error("Profile not found");
    }

    const [updated] = await db
      .update(userProfiles)
      .set({
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.dailyGoal !== undefined && { dailyGoal: input.dailyGoal }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    return toProfile(updated);
  },

  async uploadAvatar(userId, file) {
    const ext = file.type === "image/png" ? "png" : "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `${process.cwd()}/uploads/avatars/${userId}.${ext}`;

    const fs = await import("node:fs/promises");
    await fs.mkdir(`${process.cwd()}/uploads/avatars`, { recursive: true });
    await fs.writeFile(path, buffer);

    const avatarUrl = `/uploads/avatars/${userId}.${ext}`;
    const db = getDb();
    await db
      .update(userProfiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));

    return { avatarUrl };
  },
};
