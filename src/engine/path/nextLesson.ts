import type { Lesson, Unit } from '#/engine/types.ts'
import { masteryForDisplay } from '#/engine/progress/masteryRead.ts'

export function nextLesson(
  units: readonly Unit[],
  mastery: Record<string, number>,
  updatedAt?: Record<string, string>,
  now?: string,
): { unit: Unit; lesson: Lesson } {
  const today = now ?? new Date().toISOString().slice(0, 10)
  for (const unit of units) {
    if (masteryForDisplay(unit.id, mastery, updatedAt ?? {}, today) < 100) {
      return { unit, lesson: unit.lessons[0] }
    }
  }
  const first = units[0]
  return { unit: first, lesson: first.lessons[0] }
}