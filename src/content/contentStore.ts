import { create } from "zustand";

type UnitData = {
  id: string;
  title: string;
  imageUrl?: string;
  lessonIds: string[];
};

type LessonData = {
  id: string;
  title: string;
  unitId: string;
  screenIds: string[];
};

type ScreenData = {
  id: string;
  type: "concept" | "choice" | "numeric" | "allocation";
  prompt: string;
  explain: string;
  options?: { id: string; label: string }[];
  correctId?: string;
  unit?: string;
  acceptRange?: [number, number];
  categories?: string[];
  rule?: { category: string; min?: number; max?: number };
};

type ContentState = {
  units: Record<string, UnitData>;
  unitOrder: string[];
  lessons: Record<string, LessonData>;
  screens: Record<string, ScreenData>;
  seeded: boolean;

  addUnit(unit: Omit<UnitData, "lessonIds">): void;
  updateUnit(id: string, patch: Partial<UnitData>): void;
  deleteUnit(id: string): void;
  reorderUnits(ids: string[]): void;

  addLesson(unitId: string, lesson: Omit<LessonData, "unitId" | "screenIds">): void;
  updateLesson(id: string, patch: Partial<LessonData>): void;
  deleteLesson(id: string): void;
  reorderLessons(unitId: string, lessonIds: string[]): void;

  addScreen(lessonId: string, screen: Omit<ScreenData, "id">): void;
  updateScreen(id: string, patch: Partial<ScreenData>): void;
  deleteScreen(id: string): void;
  reorderScreens(lessonId: string, screenIds: string[]): void;

  seedIfEmpty(): void;
};

export const contentStore = create<ContentState>()(set => ({
  units: {},
  unitOrder: [],
  lessons: {},
  screens: {},
  seeded: false,

  addUnit(unit) {
    set((s) => ({
      units: { ...s.units, [unit.id]: { ...unit, lessonIds: [] } },
      unitOrder: [...s.unitOrder, unit.id],
    }));
  },

  updateUnit(id, patch) {
    set((s) => ({
      units: { ...s.units, [id]: { ...s.units[id], ...patch } },
    }));
  },

  deleteUnit(id) {
    set((s) => {
      const unit = s.units[id];
      if (!unit) return s;
      const newLessons = { ...s.lessons };
      const newScreens = { ...s.screens };
      for (const lid of unit.lessonIds) {
        const lesson = newLessons[lid];
        if (lesson) {
          for (const sid of lesson.screenIds) {
            delete newScreens[sid];
          }
          delete newLessons[lid];
        }
      }
      const { [id]: _, ...restUnits } = s.units;
      return {
        units: restUnits,
        unitOrder: s.unitOrder.filter((uid) => uid !== id),
        lessons: newLessons,
        screens: newScreens,
      };
    });
  },

  reorderUnits(ids) {
    set({ unitOrder: ids });
  },

  addLesson(unitId, lesson) {
    set((s) => {
      const unit = s.units[unitId];
      if (!unit) return s;
      return {
        lessons: {
          ...s.lessons,
          [lesson.id]: { ...lesson, unitId, screenIds: [] },
        },
        units: {
          ...s.units,
          [unitId]: { ...unit, lessonIds: [...unit.lessonIds, lesson.id] },
        },
      };
    });
  },

  updateLesson(id, patch) {
    set((s) => ({
      lessons: { ...s.lessons, [id]: { ...s.lessons[id], ...patch } },
    }));
  },

  deleteLesson(id) {
    set((s) => {
      const lesson = s.lessons[id];
      if (!lesson) return s;
      const unit = s.units[lesson.unitId];
      const newScreens = { ...s.screens };
      for (const sid of lesson.screenIds) {
        delete newScreens[sid];
      }
      const { [id]: _, ...restLessons } = s.lessons;
      return {
        lessons: restLessons,
        screens: newScreens,
        units: unit
          ? {
              ...s.units,
              [unit.id]: {
                ...unit,
                lessonIds: unit.lessonIds.filter((lid) => lid !== id),
              },
            }
          : s.units,
      };
    });
  },

  reorderLessons(unitId, lessonIds) {
    set((s) => ({
      units: {
        ...s.units,
        [unitId]: { ...s.units[unitId], lessonIds },
      },
    }));
  },

  addScreen(lessonId, screen) {
    const id = crypto.randomUUID();
    set((s) => {
      const lesson = s.lessons[lessonId];
      if (!lesson) return s;
      return {
        screens: { ...s.screens, [id]: { ...screen, id } },
        lessons: {
          ...s.lessons,
          [lessonId]: {
            ...lesson,
            screenIds: [...lesson.screenIds, id],
          },
        },
      };
    });
  },

  updateScreen(id, patch) {
    set((s) => ({
      screens: { ...s.screens, [id]: { ...s.screens[id], ...patch } },
    }));
  },

  deleteScreen(id) {
    set((s) => {
      const screen = s.screens[id];
      if (!screen) return s;
      for (const lesson of Object.values(s.lessons)) {
        if (lesson.screenIds.includes(id)) {
          const { [id]: _, ...restScreens } = s.screens;
          return {
            screens: restScreens,
            lessons: {
              ...s.lessons,
              [lesson.id]: {
                ...lesson,
                screenIds: lesson.screenIds.filter((sid) => sid !== id),
              },
            },
          };
        }
      }
      return s;
    });
  },

  reorderScreens(lessonId, screenIds) {
    set((s) => ({
      lessons: {
        ...s.lessons,
        [lessonId]: { ...s.lessons[lessonId], screenIds },
      },
    }));
  },

  seedIfEmpty() {
    // will be wired in Step 3
  },
}));

export const useContentStore = contentStore;