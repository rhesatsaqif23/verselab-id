// Test helpers for resetting the progress store.
import { useProgressStore } from "#/engine/progress/progressStore.ts";

const UNIT_IDS = ["keuangan", "akuntansi", "manajemen-produk", "kewirausahaan"];

export function resetProgress() {
  localStorage.clear();
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: {},
    masteryUpdatedAt: {},
  });
}

export function setMastery(value: number) {
  useProgressStore.setState({
    mastery: Object.fromEntries(UNIT_IDS.map((id) => [id, value])),
  });
}
