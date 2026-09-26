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
  if (mastery == null || Number.isNaN(mastery)) return 0;
  if (updatedAt == null) return mastery;
  const weeks = fullWeeksSince(updatedAt, now);
  // Unparsable dates (bad timestamps) must never surface as NaN% in the UI.
  if (Number.isNaN(weeks)) return mastery;
  return Math.max(0, mastery - weeks * DECAY_PER_WEEK);
}
