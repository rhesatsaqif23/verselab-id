// Mastery decay: mastery drops by a fixed amount per full week of inactivity.
import { daysBetween } from "#/libs/date.ts";

export const DECAY_PER_WEEK = 2;

export function fullWeeksSince(updatedAt: string, now: string): number {
  const days = daysBetween(updatedAt, now);
  if (days <= 0) return 0;
  return Math.floor(days / 7);
}

export function decayedMastery(
  mastery: number,
  updatedAt: string | undefined,
  now: string,
): number {
  if (!updatedAt) return mastery;
  return Math.max(0, mastery - fullWeeksSince(updatedAt, now) * DECAY_PER_WEEK);
}
