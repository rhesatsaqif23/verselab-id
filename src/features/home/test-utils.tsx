import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { units } from '#/content/index.ts'

export function resetProgress() {
  localStorage.clear()
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: {},
    masteryUpdatedAt: {},
  })
}

export function setMastery(value: number) {
  useProgressStore.setState({
    mastery: Object.fromEntries(units.map((u) => [u.id, value])),
  })
}
