import type { ProgressPatch, ServerProgress } from "@verselab/shared/schemas/progress";
import { eq, and, gte, sql } from "drizzle-orm";
import { getDb } from "../../database/index.ts";
import { userProgress, userUnitProgress, userDailyActivity } from "../../database/schema.ts";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function streakOnActivity(
  state: { streak: number; streakFreeze: number; lastActiveDate: string | null },
  today: string,
): { streak: number; streakFreeze: number; lastActiveDate: string } {
  if (!state.lastActiveDate) {
    return { streak: 1, streakFreeze: 0, lastActiveDate: today };
  }
  if (today === state.lastActiveDate) {
    return { streak: state.streak, streakFreeze: state.streakFreeze, lastActiveDate: today };
  }
  if (today === addDays(state.lastActiveDate, 1)) {
    const streak = state.streak + 1;
    const streakFreeze = state.streakFreeze + (streak % 7 === 0 ? 1 : 0);
    return { streak, streakFreeze, lastActiveDate: today };
  }
  if (state.streakFreeze > 0) {
    return {
      streak: state.streak,
      streakFreeze: state.streakFreeze - 1,
      lastActiveDate: today,
    };
  }
  return { streak: 1, streakFreeze: 0, lastActiveDate: today };
}

export type ProgressService = {
  getProgress: (userId: string) => Promise<ServerProgress>;
  putProgress: (userId: string, patch: ProgressPatch) => Promise<ServerProgress>;
  updateDailyGoal: (userId: string, minutes: number) => Promise<ServerProgress>;
};

export const progressService: ProgressService = {
  async getProgress(userId) {
    const db = getDb();

    const [progressRow] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);

    const unitRows = await db
      .select()
      .from(userUnitProgress)
      .where(eq(userUnitProgress.userId, userId));

    const sevenDaysAgo = addDays(todayStr(), -7);
    const activityRows = await db
      .select({ date: userDailyActivity.date })
      .from(userDailyActivity)
      .where(and(eq(userDailyActivity.userId, userId), gte(userDailyActivity.date, sevenDaysAgo)))
      .orderBy(sql`${userDailyActivity.date} DESC`);

    return {
      xp: progressRow?.xp ?? 0,
      streak: progressRow?.streak ?? 0,
      streakFreeze: progressRow?.streakFreeze ?? 0,
      lastActiveDate: progressRow?.lastActiveDate ?? null,
      completedLessons: progressRow?.completedLessons ?? [],
      units: unitRows.map((r) => ({
        unitId: r.unitId,
        mastery: r.mastery,
        masteryUpdatedAt: r.masteryUpdatedAt.toISOString(),
      })),
      recentActivity: activityRows.map((r) => r.date),
      dailyGoalMinutes: progressRow?.dailyGoalMinutes ?? 10,
    };
  },

  async putProgress(userId, patch) {
    const db = getDb();
    const today = todayStr();

    // Load existing progress
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);

    // Compute new streak
    const streakResult = streakOnActivity(
      {
        streak: existing?.streak ?? 0,
        streakFreeze: existing?.streakFreeze ?? 0,
        lastActiveDate: existing?.lastActiveDate ?? null,
      },
      today,
    );

    // XP: always max(local, server)
    const newXp = Math.max(patch.xp ?? 0, existing?.xp ?? 0);

    // Completed lessons: union
    const existingLessons = existing?.completedLessons ?? [];
    const patchLessons = patch.completedLessons ?? [];
    const mergedLessons = [...new Set([...existingLessons, ...patchLessons])];

    // Upsert progress row
    if (existing) {
      await db
        .update(userProgress)
        .set({
          xp: newXp,
          streak: streakResult.streak,
          streakFreeze: streakResult.streakFreeze,
          lastActiveDate: streakResult.lastActiveDate,
          completedLessons: mergedLessons,
          dailyGoalMinutes: patch.dailyGoalMinutes ?? existing.dailyGoalMinutes,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.userId, userId));
    } else {
      await db.insert(userProgress).values({
        userId,
        xp: newXp,
        streak: streakResult.streak,
        streakFreeze: streakResult.streakFreeze,
        lastActiveDate: streakResult.lastActiveDate,
        completedLessons: mergedLessons,
        dailyGoalMinutes: patch.dailyGoalMinutes ?? 10,
      });
    }

    // Upsert unit mastery (max)
    for (const unit of patch.units ?? []) {
      const [existingUnit] = await db
        .select()
        .from(userUnitProgress)
        .where(and(eq(userUnitProgress.userId, userId), eq(userUnitProgress.unitId, unit.unitId)))
        .limit(1);

      const newMastery = Math.max(unit.mastery, existingUnit?.mastery ?? 0);

      if (existingUnit) {
        await db
          .update(userUnitProgress)
          .set({ mastery: newMastery, masteryUpdatedAt: new Date() })
          .where(
            and(eq(userUnitProgress.userId, userId), eq(userUnitProgress.unitId, unit.unitId)),
          );
      } else {
        await db.insert(userUnitProgress).values({
          userId,
          unitId: unit.unitId,
          mastery: newMastery,
        });
      }
    }

    // Record activity (insert on conflict do nothing)
    if (patch.activityDate) {
      await db
        .insert(userDailyActivity)
        .values({ userId, date: patch.activityDate })
        .onConflictDoNothing();
    }

    // Return fresh state
    return this.getProgress(userId);
  },

  async updateDailyGoal(userId, minutes) {
    const db = getDb();
    await db
      .update(userProgress)
      .set({ dailyGoalMinutes: minutes, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId));
    return this.getProgress(userId);
  },
};
