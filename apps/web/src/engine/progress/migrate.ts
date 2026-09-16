// Legacy migration: imports localStorage progress into server on first login.
import type { ProgressPatch } from "@verselab/shared/schemas/progress";
import { putProgress } from "#/libs/api.ts";

const STORAGE_KEY = "verselab-progress-v1";

/** Import localStorage progress into server on first login. */
export async function migrateLegacyProgress(): Promise<boolean> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const local = JSON.parse(raw).state;
    const patch: ProgressPatch = {
      xp: local.xp ?? 0,
      streak: local.streak ?? 0,
      streakFreeze: local.streakFreeze ?? 0,
      lastActiveDate: local.lastActiveDate ?? null,
      completedLessons: local.completedLessons ?? [],
      units: Object.entries(local.mastery ?? {}).map(([unitId, mastery]) => ({
        unitId,
        mastery: mastery as number,
        masteryUpdatedAt: local.masteryUpdatedAt?.[unitId] ?? new Date().toISOString(),
      })),
      activityDate: local.lastActiveDate ?? undefined,
    };
    await putProgress({ data: patch });
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
