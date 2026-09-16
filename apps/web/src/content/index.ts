// Content registry: unit/lesson lookup helpers and next-lesson wiring.
// Content is served from the DB via the API; static array is the fallback
// for client-side rendering until all consumers are migrated to async.
import type { Unit, Lesson } from "#/engine/types.ts";
import { units as staticUnits } from "#/content/units.ts";

export function findLesson(lessonId: string): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of staticUnits) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return {
        unit: {
          id: unit.id,
          title: unit.title,
          description: unit.description,
          imageUrl: unit.imageUrl,
          lessons: unit.lessons,
        },
        lesson,
      };
    }
  }
  return undefined;
}

export function findUnit(unitId: string): Unit | undefined {
  const unit = staticUnits.find((u) => u.id === unitId);
  if (!unit) return undefined;
  return {
    id: unit.id,
    title: unit.title,
    description: unit.description,
    imageUrl: unit.imageUrl,
    lessons: unit.lessons,
  };
}

export { nextLesson } from "#/engine/path/nextLesson.ts";

export function getUnits(): readonly Unit[] {
  return staticUnits;
}

// Re-export static units for all feature consumers
export { units } from "#/content/units.ts";
