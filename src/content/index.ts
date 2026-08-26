// Content registry: unit/lesson lookup helpers and next-lesson wiring.
import type { Unit, Lesson, Screen } from "#/engine/types.ts"
import { contentStore } from "#/content/contentStore.ts"

// Seed on first import
contentStore.getState().seedIfEmpty()

export function findLesson(lessonId: string): { unit: Unit; lesson: Lesson } | undefined {
  const state = contentStore.getState()
  const lessonData = state.lessons[lessonId]
  if (!lessonData) return undefined

  const unitData = state.units[lessonData.unitId]
  if (!unitData) return undefined

  const unit: Unit = {
    id: unitData.id,
    title: unitData.title,
    imageUrl: unitData.imageUrl,
    lessons: unitData.lessonIds
      .map((lid) => {
        const l = state.lessons[lid]
        if (!l) return undefined
        return {
          id: l.id,
          title: l.title,
          screens: l.screenIds
            .map((sid) => state.screens[sid])
            .filter(Boolean) as readonly Screen[],
        }
      })
      .filter(Boolean) as readonly Lesson[],
  }

  const lesson: Lesson = {
    id: lessonData.id,
    title: lessonData.title,
    screens: lessonData.screenIds
      .map((sid) => state.screens[sid])
      .filter(Boolean) as readonly Screen[],
  }

  return { unit, lesson }
}

export { nextLesson } from "#/engine/path/nextLesson.ts"

// Re-export units from store so existing imports still work
export function getUnits(): readonly Unit[] {
  const state = contentStore.getState()
  return state.unitOrder
    .map((uid) => {
      const u = state.units[uid]
      if (!u) return undefined
      return {
        id: u.id,
        title: u.title,
        imageUrl: u.imageUrl,
        lessons: u.lessonIds
          .map((lid) => {
            const l = state.lessons[lid]
            if (!l) return undefined
            return {
              id: l.id,
              title: l.title,
              screens: l.screenIds
                .map((sid) => state.screens[sid])
                .filter(Boolean) as readonly Screen[],
            }
          })
          .filter(Boolean) as readonly Lesson[],
      }
    })
    .filter(Boolean) as readonly Unit[]
}

// Re-export static units for all feature consumers (always populated)
export { units } from "#/content/units.ts"