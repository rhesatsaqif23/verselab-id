// Structure and correctness tests for the first finance lesson.
import { describe, expect, it } from "vitest";
import { nabungAwalLesson } from "#/content/lessons/keuangan/nabung-awal.ts";
import { futureValue } from "#/domains/personal-finance/math.ts";
import type { Screen } from "#/engine/types.ts";

const screens = nabungAwalLesson.screens;

describe("nabung-awal lesson", () => {
  it("has exactly six screens", () => {
    expect(screens).toHaveLength(6);
  });

  it("opens with a choice and names the concept second", () => {
    expect(screens[0].type).toBe("choice");
    expect(screens[1].type).toBe("concept");
  });

  it("has exactly one concept screen", () => {
    const concepts = screens.filter((s) => s.type === "concept");
    expect(concepts).toHaveLength(1);
  });

  it("gives every non-concept screen an explanation", () => {
    for (const screen of screens) {
      if (screen.type === "concept") continue;
      expect(screen.explain.trim().length).toBeGreaterThan(0);
    }
  });

  it("screen 3 range brackets the computed future value", () => {
    const screen = screens[2] as Extract<Screen, { type: "numeric" }>;
    const value = futureValue(0, 500_000, 6, 10) / 1_000_000;
    expect(screen.acceptRange[0]).toBeLessThanOrEqual(value);
    expect(screen.acceptRange[1]).toBeGreaterThanOrEqual(value);
  });

  it("screen 4 range brackets the computed 5-year value", () => {
    const screen = screens[3] as Extract<Screen, { type: "numeric" }>;
    const value = futureValue(0, 500_000, 6, 5) / 1_000_000;
    expect(screen.acceptRange[0]).toBeLessThanOrEqual(value);
    expect(screen.acceptRange[1]).toBeGreaterThanOrEqual(value);
  });

  it("screen 5 enforces a minimum 20% tabungan", () => {
    const screen = screens[4] as Extract<Screen, { type: "allocation" }>;
    expect(screen.rule.category).toBe("Tabungan");
    expect(screen.rule.min).toBe(20);
  });

  it("screen 6 marks the credit-card option as correct", () => {
    const screen = screens[5] as Extract<Screen, { type: "choice" }>;
    const correct = screen.options.find((o) => o.id === screen.correctId);
    expect(correct?.label).toContain("kartu kredit");
  });
});
