export const DECAY_PER_WEEK = 2

function parseDate(date: string): Date {
  return new Date(date + 'T00:00:00')
}

export function daysBetween(from: string, to: string): number {
  const a = parseDate(from).getTime()
  const b = parseDate(to).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function fullWeeksSince(updatedAt: string, now: string): number {
  const days = daysBetween(updatedAt, now)
  if (days <= 0) return 0
  return Math.floor(days / 7)
}

export function decayedMastery(
  mastery: number,
  updatedAt: string | undefined,
  now: string
): number {
  if (!updatedAt) return mastery
  return Math.max(0, mastery - fullWeeksSince(updatedAt, now) * DECAY_PER_WEEK)
}