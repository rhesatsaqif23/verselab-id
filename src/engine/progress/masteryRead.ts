import { decayedMastery } from './decay.ts'

export function isUnitStarted(
  unitId: string,
  mastery: Record<string, number>,
): boolean {
  return mastery[unitId] !== undefined
}

export function masteryForDisplay(
  unitId: string,
  mastery: Record<string, number>,
  updatedAt: Record<string, string>,
  now: string,
): number {
  const value = mastery[unitId]
  if (value === undefined) return 0
  return decayedMastery(value, updatedAt[unitId], now)
}