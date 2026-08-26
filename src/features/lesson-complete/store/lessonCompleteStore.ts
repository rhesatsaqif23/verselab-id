// Store holding the summary of the last completed lesson.
import { create } from "zustand";

export type WrongScreen = {
  prompt: string;
  explain: string;
};

export type LessonCompleteSummary = {
  unitId: string;
  unitName: string;
  totalScreens: number;
  correctCount: number;
  wrongScreens: WrongScreen[];
  xpEarned: number;
  masteryBefore: number | null;
  masteryAfter: number | null;
};

type LessonCompleteState = {
  summary: LessonCompleteSummary | null;
  setSummary: (summary: LessonCompleteSummary) => void;
  clear: () => void;
};

export const useLessonCompleteStore = create<LessonCompleteState>((set) => ({
  summary: null,
  setSummary: (summary) => set({ summary }),
  clear: () => set({ summary: null }),
}));
