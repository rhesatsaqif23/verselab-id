import type { User } from "better-auth/types";
import type { Profile, UpdateProfileInput } from "@verselab/shared/schemas/profile";
import { eq } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { userProfiles } from "../../database/schema.ts";
import { user as authUserTable } from "../../database/auth-schema.ts";
import { assertImage, deleteOldImage, extFor, getStorage } from "../../libs/storage.ts";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  displayName: string | null;
  avatarUrl: string | null;
  onboardedAt: Date | null;
};

export type UserService = {
  getMe: (user: User) => Promise<{ user: User; profile: Profile | null; role: string }>;
  updateProfile: (userId: string, input: UpdateProfileInput) => Promise<Profile>;
  uploadAvatar: (userId: string, file: File) => Promise<{ avatarUrl: string }>;
  listAllUsers: () => Promise<AdminUser[]>;
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
    const db = getDb();
    const [profileRow] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    const [userRow] = await db
      .select({ role: authUserTable.role })
      .from(authUserTable)
      .where(eq(authUserTable.id, user.id))
      .limit(1);

    return {
      user,
      profile: profileRow ? toProfile(profileRow) : null,
      role: userRow?.role ?? "user",
    };
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
    assertImage(file);
    const ext = extFor(file.type);
    const key = `avatars/${userId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const db = getDb();
    const [existing] = await db
      .select({ avatarUrl: userProfiles.avatarUrl })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const avatarUrl = await getStorage().put(key, buffer, file.type);
    await db
      .update(userProfiles)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId));

    await deleteOldImage(existing?.avatarUrl, key);
    return { avatarUrl };
  },

  async listAllUsers() {
    const db = getDb();
    const rows = await db
      .select({
        id: authUserTable.id,
        name: authUserTable.name,
        email: authUserTable.email,
        role: authUserTable.role,
        image: authUserTable.image,
        createdAt: authUserTable.createdAt,
        displayName: userProfiles.displayName,
        avatarUrl: userProfiles.avatarUrl,
        onboardedAt: userProfiles.onboardedAt,
      })
      .from(authUserTable)
      .leftJoin(userProfiles, eq(authUserTable.id, userProfiles.userId));
    return rows.map((r) => ({
      ...r,
      role: r.role ?? "user",
    }));
  },
};
