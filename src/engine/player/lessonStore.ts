// Lesson session store: current screen index, answers, and per-screen results.
import { create } from "zustand";

export type LessonResult = {
  correct: boolean;
};

type LessonState = {
  index: number;
  total: number;
  answers: Record<number, unknown>;
  results: Record<number, LessonResult>;
  correctCount: number;
  wrongCount: number;
};

type LessonActions = {
  startLesson: (total: number) => void;
  setAnswer: (index: number, answer: unknown) => void;
  checkResult: (index: number, correct: boolean) => void;
  next: () => void;
  clear: () => void;
};

export const useLessonStore = create<LessonState & LessonActions>((set) => ({
  index: 0,
  total: 0,
  answers: {},
  results: {},
  correctCount: 0,
  wrongCount: 0,

  startLesson: (total) =>
    set({ index: 0, total, answers: {}, results: {}, correctCount: 0, wrongCount: 0 }),

  setAnswer: (index, answer) =>
    set((state) => ({
      answers: { ...state.answers, [index]: answer },
    })),

  checkResult: (index, correct) =>
    set((state) => ({
      results: { ...state.results, [index]: { correct } },
      correctCount: state.correctCount + (correct ? 1 : 0),
      wrongCount: state.wrongCount + (correct ? 0 : 1),
    })),

  next: () => set((state) => ({ index: state.index + 1 })),

  clear: () =>
    set({ index: 0, total: 0, answers: {}, results: {}, correctCount: 0, wrongCount: 0 }),
}));
