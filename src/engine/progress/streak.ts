// Streak logic: increments, freeze usage, and reset rules per activity.
import { addDays } from '#/libs/date.ts'

export type StreakState = {
  streak: number
  streakFreeze: number
  lastActiveDate: string | null
}

export function streakOnActivity(state: StreakState, today: string): StreakState {
  if (!state.lastActiveDate) {
    return { streak: 1, streakFreeze: 0, lastActiveDate: today }
  }

  if (today === state.lastActiveDate) {
    return state
  }

  if (today === addDays(state.lastActiveDate, 1)) {
    const streak = state.streak + 1
    const streakFreeze = state.streakFreeze + (streak % 7 === 0 ? 1 : 0)
    return { streak, streakFreeze, lastActiveDate: today }
  }

  if (state.streakFreeze > 0) {
    return { ...state, streakFreeze: state.streakFreeze - 1, lastActiveDate: today }
  }

  return { streak: 1, streakFreeze: 0, lastActiveDate: today }
}
