import type { UnitData } from "./unit.ts";
import type { LessonData } from "./lesson.ts";
import type { ScreenData } from "./screen.ts";

export type ContentState = {
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
