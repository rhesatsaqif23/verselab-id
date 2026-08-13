import type { Lesson, Unit } from '#/engine/types.ts'
import { units } from './units.ts'

export function findLesson(
  lessonId: string,
): { unit: Unit; lesson: Lesson } | undefined {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId)
    if (lesson) return { unit, lesson }
  }
  return undefined
}

export { nextLesson } from '#/engine/path/nextLesson.ts'

export function todayString(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export { units }
