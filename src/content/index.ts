// Content registry: unit/lesson lookup helpers and next-lesson wiring.
import type { Lesson, Unit } from "#/engine/types.ts";
import { units } from "./units.ts";

export function findLesson(lessonId: string): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return undefined;
}

export { nextLesson } from "#/engine/path/nextLesson.ts";

export { units };
