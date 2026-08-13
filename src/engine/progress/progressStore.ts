import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { streakOnActivity } from './streak.ts'

export type DailyGoalMinutes = 3 | 10 | 20

export const XP_PER_SCREEN = 10
export const XP_PER_LESSON = 50
export const MASTERY_CORRECT = 2
export const MASTERY_WRONG = 1
export const MASTERY_MIN = 0
export const MASTERY_MAX = 100

type ProgressState = {
  xp: number
  dailyGoalMinutes: DailyGoalMinutes
  streak: number
  streakFreeze: number
  lastActiveDate: string | null
  activeDays: string[]
  mastery: Record<string, number>
  masteryUpdatedAt: Record<string, string>
}

type ProgressActions = {
  awardXp: (amount: number) => void
  awardScreenResult: (unitId: string, correct: boolean) => void
  awardLessonCompletion: (unitId: string) => void
  setDailyGoal: (minutes: DailyGoalMinutes) => void
  registerActivity: (date?: string) => void
}

function todayString(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set) => ({
      xp: 0,
      dailyGoalMinutes: 10,
      streak: 0,
      streakFreeze: 0,
      lastActiveDate: null,
      activeDays: [],
      mastery: {},
      masteryUpdatedAt: {},

      awardXp: (amount) =>
        set((state) => ({ xp: Math.max(0, state.xp + amount) })),

      awardScreenResult: (unitId, correct) =>
        set((state) => {
          const started = state.mastery[unitId] ?? 0
          return {
            xp: state.xp + (correct ? XP_PER_SCREEN : 0),
            mastery: {
              ...state.mastery,
              [unitId]: clamp(
                started + (correct ? MASTERY_CORRECT : -MASTERY_WRONG),
                MASTERY_MIN,
                MASTERY_MAX
              ),
            },
            masteryUpdatedAt: {
              ...state.masteryUpdatedAt,
              [unitId]: todayString(),
            },
          }
        }),

      awardLessonCompletion: (unitId) =>
        set((state) => {
          const today = todayString()
          const result = streakOnActivity(
            {
              streak: state.streak,
              streakFreeze: state.streakFreeze,
              lastActiveDate: state.lastActiveDate,
            },
            today
          )
          const activeDays = state.activeDays.includes(today)
            ? state.activeDays
            : [...state.activeDays, today]
          return {
            xp: state.xp + XP_PER_LESSON,
            streak: result.streak,
            streakFreeze: result.streakFreeze,
            lastActiveDate: result.lastActiveDate,
            activeDays,
            mastery: { ...state.mastery, [unitId]: state.mastery[unitId] ?? 50 },
            masteryUpdatedAt: {
              ...state.masteryUpdatedAt,
              [unitId]: today,
            },
          }
        }),

      setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),

      registerActivity: (date) =>
        set((state) => {
          const today = date ?? todayString()
          const result = streakOnActivity(
            {
              streak: state.streak,
              streakFreeze: state.streakFreeze,
              lastActiveDate: state.lastActiveDate,
            },
            today
          )
          return {
            streak: result.streak,
            streakFreeze: result.streakFreeze,
            lastActiveDate: result.lastActiveDate,
          }
        }),
    }),
    {
      name: 'verselab-progress-v1',
    }
  )
)
