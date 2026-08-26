// Tests for the lesson session store.
import { beforeEach, describe, expect, it } from "vitest";
import { useLessonStore } from "#/engine/player/lessonStore.ts";

const store = () => useLessonStore.getState();

beforeEach(() => {
  useLessonStore.setState({
    index: 0,
    total: 0,
    answers: {},
    results: {},
    correctCount: 0,
    wrongCount: 0,
  });
});

describe("useLessonStore", () => {
  it("startLesson resets to a fresh lesson", () => {
    useLessonStore.setState({
      index: 2,
      total: 3,
      answers: { 0: "x" },
      results: { 0: { correct: true } },
      correctCount: 1,
      wrongCount: 0,
    });
    store().startLesson(5);
    expect(store().index).toBe(0);
    expect(store().total).toBe(5);
    expect(store().answers).toEqual({});
    expect(store().results).toEqual({});
    expect(store().correctCount).toBe(0);
    expect(store().wrongCount).toBe(0);
  });

  it("setAnswer stores the answer under the given index", () => {
    store().startLesson(2);
    store().setAnswer(0, "a");
    expect(store().answers[0]).toBe("a");
  });

  it("checkResult(true) increments correctCount", () => {
    store().startLesson(2);
    store().checkResult(0, true);
    expect(store().correctCount).toBe(1);
    expect(store().wrongCount).toBe(0);
    expect(store().results[0]).toEqual({ correct: true });
  });

  it("checkResult(false) increments wrongCount", () => {
    store().startLesson(2);
    store().checkResult(0, false);
    expect(store().correctCount).toBe(0);
    expect(store().wrongCount).toBe(1);
    expect(store().results[0]).toEqual({ correct: false });
  });

  it("next advances the index", () => {
    store().startLesson(3);
    store().next();
    expect(store().index).toBe(1);
  });

  it("clear empties all state", () => {
    store().startLesson(3);
    store().setAnswer(0, "a");
    store().checkResult(0, true);
    store().next();
    store().clear();
    expect(store().index).toBe(0);
    expect(store().total).toBe(0);
    expect(store().answers).toEqual({});
    expect(store().results).toEqual({});
    expect(store().correctCount).toBe(0);
    expect(store().wrongCount).toBe(0);
  });

  it("a second startLesson leaves no residue from the first", () => {
    store().startLesson(3);
    store().setAnswer(0, "a");
    store().checkResult(0, false);
    store().next();
    store().startLesson(4);
    expect(store().index).toBe(0);
    expect(store().total).toBe(4);
    expect(store().answers).toEqual({});
    expect(store().results).toEqual({});
    expect(store().correctCount).toBe(0);
    expect(store().wrongCount).toBe(0);
  });
});
