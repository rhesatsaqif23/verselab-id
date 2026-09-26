// Global progress store: XP, streak, mastery, and daily goal.
// Server-synced via sync.ts; hydrated on login.
import { create } from "zustand";
import type { ServerProgress } from "@verselab/shared/schemas/progress";
import { dateOnly, todayString } from "#/libs/date.ts";
import { streakOnActivity } from "./streak.ts";
import { scheduleSync } from "./sync.ts";
import { getProgress, updateDailyGoal } from "#/libs/api.ts";

export type DailyGoalMinutes = 3 | 5 | 10 | 15 | 20;

export const XP_PER_SCREEN = 10;
export const XP_PER_LESSON = 50;
export const MASTERY_CORRECT = 2;
export const MASTERY_WRONG = 1;
export const MASTERY_MIN = 0;
export const MASTERY_MAX = 100;

type ProgressState = {
  hydrated: boolean;
  xp: number;
  dailyGoalMinutes: DailyGoalMinutes;
  streak: number;
  streakFreeze: number;
  lastActiveDate: string | null;
  activeDays: string[];
  mastery: Record<string, number>;
  masteryUpdatedAt: Record<string, string>;
  completedLessons: string[];
};

type ProgressActions = {
  hydrateFromServer: (data: ServerProgress) => void;
  awardXp: (amount: number) => void;
  awardScreenResult: (unitId: string, correct: boolean) => void;
  awardLessonCompletion: (unitId: string, lessonId: string) => void;
  setDailyGoal: (minutes: DailyGoalMinutes) => void;
  registerActivity: (date?: string) => void;
  refreshFromServer: () => void;
  reset: () => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const hydrateFromServer = (set: any, data: ServerProgress): void => {
  set({
    hydrated: true,
    xp: data.xp,
    streak: data.streak,
    streakFreeze: data.streakFreeze,
    lastActiveDate: data.lastActiveDate,
    completedLessons: data.completedLessons,
    activeDays: data.recentActivity,
    dailyGoalMinutes: data.dailyGoalMinutes as DailyGoalMinutes,
    mastery: Object.fromEntries(data.units.map((u: any) => [u.unitId, u.mastery])),
    // The server sends ISO timestamps; the store keeps YYYY-MM-DD so decay
    // math never parses "2026-09-26T08:54:00.000ZT00:00:00" into NaN.
    masteryUpdatedAt: Object.fromEntries(
      data.units.map((u: any) => [u.unitId, dateOnly(u.masteryUpdatedAt)]),
    ),
  });
};

const awardXp = (set: any, amount: number): void => {
  set((state: any) => ({ xp: Math.max(0, state.xp + amount) }));
};

const awardScreenResult = (set: any, unitId: string, correct: boolean): void => {
  set((state: any) => {
    const started = state.mastery[unitId] ?? 0;
    const next = {
      xp: state.xp + (correct ? XP_PER_SCREEN : 0),
      mastery: {
        ...state.mastery,
        [unitId]: clamp(
          started + (correct ? MASTERY_CORRECT : -MASTERY_WRONG),
          MASTERY_MIN,
          MASTERY_MAX,
        ),
      },
      masteryUpdatedAt: {
        ...state.masteryUpdatedAt,
        [unitId]: todayString(),
      },
    };
    scheduleSync({
      xp: next.xp,
      units: [
        {
          unitId,
          mastery: next.mastery[unitId],
          masteryUpdatedAt: next.masteryUpdatedAt[unitId],
        },
      ],
    });
    return next;
  });
};

const awardLessonCompletion = (set: any, unitId: string, lessonId: string): void => {
  set((state: any) => {
    const today = todayString();
    const result = streakOnActivity(
      {
        streak: state.streak,
        streakFreeze: state.streakFreeze,
        lastActiveDate: state.lastActiveDate,
      },
      today,
    );
    const activeDays = state.activeDays.includes(today)
      ? state.activeDays
      : [...state.activeDays, today];
    const completed = state.completedLessons.includes(lessonId)
      ? state.completedLessons
      : [...state.completedLessons, lessonId];
    const next = {
      xp: state.xp + XP_PER_LESSON,
      streak: result.streak,
      streakFreeze: result.streakFreeze,
      lastActiveDate: result.lastActiveDate,
      activeDays,
      mastery: { ...state.mastery, [unitId]: state.mastery[unitId] || 50 },
      masteryUpdatedAt: { ...state.masteryUpdatedAt, [unitId]: today },
      completedLessons: completed,
    };
    scheduleSync({
      xp: next.xp,
      streak: next.streak,
      streakFreeze: next.streakFreeze,
      lastActiveDate: next.lastActiveDate,
      completedLessons: next.completedLessons,
      units: [
        {
          unitId,
          mastery: next.mastery[unitId],
          masteryUpdatedAt: next.masteryUpdatedAt[unitId],
        },
      ],
      activityDate: today,
    });
    return next;
  });
};

const setDailyGoalFn = (set: any, minutes: DailyGoalMinutes): void => {
  set({ dailyGoalMinutes: minutes });
  updateDailyGoal({ data: { minutes } }).catch(() => {
    getProgress().then((serverData: any) => {
      if (serverData) {
        set({ dailyGoalMinutes: serverData.dailyGoalMinutes as DailyGoalMinutes });
      }
    });
  });
};

const registerActivity = (set: any, date?: string): void => {
  set((state: any) => {
    const today = date ?? todayString();
    const result = streakOnActivity(
      {
        streak: state.streak,
        streakFreeze: state.streakFreeze,
        lastActiveDate: state.lastActiveDate,
      },
      today,
    );
    return {
      streak: result.streak,
      streakFreeze: result.streakFreeze,
      lastActiveDate: result.lastActiveDate,
    };
  });
};

const refreshFromServer = (set: any): void => {
  getProgress().then((serverData: any) => {
    if (serverData) {
      set({
        xp: serverData.xp,
        streak: serverData.streak,
        streakFreeze: serverData.streakFreeze,
        lastActiveDate: serverData.lastActiveDate,
        completedLessons: serverData.completedLessons,
        activeDays: serverData.recentActivity,
        dailyGoalMinutes: serverData.dailyGoalMinutes as DailyGoalMinutes,
        mastery: Object.fromEntries(serverData.units.map((u: any) => [u.unitId, u.mastery])),
        masteryUpdatedAt: Object.fromEntries(
          serverData.units.map((u: any) => [u.unitId, dateOnly(u.masteryUpdatedAt)]),
        ),
      });
    }
  });
};

const resetFn = (set: any): void => {
  set({
    hydrated: false,
    xp: 0,
    dailyGoalMinutes: 10 as DailyGoalMinutes,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    activeDays: [],
    mastery: {},
    masteryUpdatedAt: {},
    completedLessons: [],
  });
};

const storeCreator = (set: any) => ({
  hydrated: false,
  xp: 0,
  dailyGoalMinutes: 10 as DailyGoalMinutes,
  streak: 0,
  streakFreeze: 0,
  lastActiveDate: null,
  activeDays: [],
  mastery: {},
  masteryUpdatedAt: {},
  completedLessons: [],
  hydrateFromServer: (data: ServerProgress) => hydrateFromServer(set, data),
  awardXp: (amount: number) => awardXp(set, amount),
  awardScreenResult: (unitId: string, correct: boolean) => awardScreenResult(set, unitId, correct),
  awardLessonCompletion: (unitId: string, lessonId: string) =>
    awardLessonCompletion(set, unitId, lessonId),
  setDailyGoal: (minutes: DailyGoalMinutes) => setDailyGoalFn(set, minutes),
  registerActivity: (date?: string) => registerActivity(set, date),
  refreshFromServer: () => refreshFromServer(set),
  reset: () => resetFn(set),
});

export const useProgressStore = create<ProgressState & ProgressActions>()(storeCreator);
