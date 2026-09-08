// Tests for the global progress store and persistence.
import { beforeEach, describe, expect, it } from "vitest";
import {
  MASTERY_CORRECT,
  MASTERY_MAX,
  MASTERY_MIN,
  XP_PER_LESSON,
  XP_PER_SCREEN,
  useProgressStore,
} from "#/engine/progress/progressStore.ts";

const store = () => useProgressStore.getState();

beforeEach(() => {
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
});

describe("useProgressStore", () => {
  it("awardXp increases xp", () => {
    store().awardXp(10);
    expect(store().xp).toBe(10);
  });

  it("awardXp never goes below zero", () => {
    store().awardXp(-100);
    expect(store().xp).toBe(0);
  });

  it("awardScreenResult(true) adds XP and raises mastery from 0", () => {
    store().awardScreenResult("unit-a", true);
    expect(store().xp).toBe(XP_PER_SCREEN);
    expect(store().mastery["unit-a"]).toBe(MASTERY_CORRECT);
  });

  it("awardScreenResult(true) caps mastery at 100", () => {
    useProgressStore.setState({ mastery: { "unit-a": MASTERY_MAX } });
    store().awardScreenResult("unit-a", true);
    expect(store().mastery["unit-a"]).toBe(MASTERY_MAX);
  });

  it("awardScreenResult(false) lowers mastery without touching XP", () => {
    store().awardScreenResult("unit-a", false);
    expect(store().xp).toBe(0);
    expect(store().mastery["unit-a"]).toBe(0);
  });

  it("awardScreenResult(false) floors mastery at 0", () => {
    useProgressStore.setState({ mastery: { "unit-a": MASTERY_MIN } });
    store().awardScreenResult("unit-a", false);
    expect(store().mastery["unit-a"]).toBe(MASTERY_MIN);
  });

  it("awardScreenResult records the updatedAt date", () => {
    store().awardScreenResult("unit-a", true);
    expect(store().masteryUpdatedAt["unit-a"]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("awardLessonCompletion adds the bonus XP and registers activity", () => {
    store().awardLessonCompletion("unit-a", "lesson-a");
    expect(store().xp).toBe(XP_PER_LESSON);
    expect(store().streak).toBe(1);
    expect(store().lastActiveDate).not.toBeNull();
    expect(store().mastery["unit-a"]).toBe(50);
  });

  it("awardLessonCompletion seeds mastery only when the unit is not started", () => {
    useProgressStore.setState({ mastery: { "unit-a": 60 } });
    store().awardLessonCompletion("unit-a", "lesson-a");
    expect(store().mastery["unit-a"]).toBe(60);
  });

  it("awardLessonCompletion records the updatedAt date", () => {
    store().awardLessonCompletion("unit-a", "lesson-a");
    expect(store().masteryUpdatedAt["unit-a"]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("setDailyGoal updates the setting", () => {
    store().setDailyGoal(20);
    expect(store().dailyGoalMinutes).toBe(20);
  });

  it("persists state to localStorage", () => {
    store().awardXp(60);
    store().setDailyGoal(20);
    store().awardLessonCompletion("unit-a", "lesson-a");
    const raw = localStorage.getItem("verselab-progress-v1");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.xp).toBe(60 + XP_PER_LESSON);
    expect(parsed.state.dailyGoalMinutes).toBe(20);
    expect(parsed.state.streak).toBe(1);
    expect(parsed.state.masteryUpdatedAt["unit-a"]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
