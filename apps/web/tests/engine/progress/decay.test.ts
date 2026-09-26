// Tests for mastery decay logic.
import { describe, expect, it } from "vitest";
import { DECAY_PER_WEEK, decayedMastery, fullWeeksSince } from "#/engine/progress/decay.ts";
import { daysBetween } from "#/libs/date.ts";

function dateDaysAgo(days: number): string {
  const d = new Date("2026-08-13T00:00:00");
  d.setDate(d.getDate() - days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const TODAY = "2026-08-13";

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-08-13", "2026-08-13")).toBe(0);
  });

  it("counts the days between two dates", () => {
    expect(daysBetween("2026-08-05", "2026-08-13")).toBe(8);
  });

  it("returns 0 when now is before updatedAt (future-dated)", () => {
    expect(daysBetween("2026-08-20", "2026-08-13")).toBe(-7);
  });

  it("accepts ISO timestamps (server masteryUpdatedAt)", () => {
    expect(daysBetween("2026-08-05T08:54:00.000Z", "2026-08-13")).toBe(8);
    expect(daysBetween("2026-08-13", "2026-08-13T23:59:59.000Z")).toBe(0);
  });
});

describe("fullWeeksSince", () => {
  it("returns 0 for the same date", () => {
    expect(fullWeeksSince(TODAY, TODAY)).toBe(0);
  });

  it("returns 0 for less than a full week", () => {
    expect(fullWeeksSince(dateDaysAgo(6), TODAY)).toBe(0);
  });

  it("counts one full week after 7 days", () => {
    expect(fullWeeksSince(dateDaysAgo(7), TODAY)).toBe(1);
  });

  it("counts two full weeks after 15 days", () => {
    expect(fullWeeksSince(dateDaysAgo(15), TODAY)).toBe(2);
  });
});

describe("decayedMastery", () => {
  it("does not decay the same day", () => {
    expect(decayedMastery(60, TODAY, TODAY)).toBe(60);
  });

  it("decays 2 points after one full week", () => {
    expect(decayedMastery(60, dateDaysAgo(8), TODAY)).toBe(60 - DECAY_PER_WEEK);
  });

  it("decays 4 points after two full weeks", () => {
    expect(decayedMastery(60, dateDaysAgo(15), TODAY)).toBe(60 - 2 * DECAY_PER_WEEK);
  });

  it("floors at zero when decay exceeds mastery", () => {
    expect(decayedMastery(3, dateDaysAgo(15), TODAY)).toBe(0);
  });

  it("returns mastery unchanged when updatedAt is undefined", () => {
    expect(decayedMastery(60, undefined, TODAY)).toBe(60);
  });

  it("does not produce NaN for an ISO timestamp updatedAt", () => {
    const value = decayedMastery(60, "2026-08-13T08:54:00.000Z", TODAY);
    expect(Number.isNaN(value)).toBe(false);
    expect(value).toBe(60);
  });

  it("decays from an ISO timestamp updatedAt", () => {
    expect(decayedMastery(60, "2026-08-05T08:54:00.000Z", TODAY)).toBe(60 - DECAY_PER_WEEK);
  });

  it("returns mastery unchanged for an unparsable updatedAt", () => {
    expect(decayedMastery(60, "not-a-date", TODAY)).toBe(60);
  });
});
