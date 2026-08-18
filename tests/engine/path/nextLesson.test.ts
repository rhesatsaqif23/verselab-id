// Tests for path unit selection logic.
import { describe, expect, it } from 'vitest'
import { nextLesson } from '#/engine/path/nextLesson.ts'
import type { Unit } from '#/engine/types.ts'

const unitA: Unit = {
  id: 'unit-a',
  title: 'Unit A',
  lessons: [{ id: 'lesson-a1', title: 'Lesson A1', screens: [] }],
}

const unitB: Unit = {
  id: 'unit-b',
  title: 'Unit B',
  lessons: [{ id: 'lesson-b1', title: 'Lesson B1', screens: [] }],
}

const units = [unitA, unitB]

const TODAY = '2026-08-13'

describe('nextLesson', () => {
  it('returns the first unit when no unit is started', () => {
    const next = nextLesson(units, {})
    expect(next.unit.id).toBe('unit-a')
    expect(next.lesson.id).toBe('lesson-a1')
  })

  it('returns the first unfinished unit when later units are started', () => {
    const mastery = { 'unit-a': 0, 'unit-b': 60 }
    const next = nextLesson(units, mastery)
    expect(next.unit.id).toBe('unit-a')
  })

  it('moves to the next unit when the first is fully mastered', () => {
    const mastery = { 'unit-a': 100, 'unit-b': 60 }
    const next = nextLesson(units, mastery)
    expect(next.unit.id).toBe('unit-b')
  })

  it('falls back to the first unit when all are mastered', () => {
    const mastery = { 'unit-a': 100, 'unit-b': 100 }
    const next = nextLesson(units, mastery)
    expect(next.unit.id).toBe('unit-a')
    expect(next.lesson.id).toBe('lesson-a1')
  })

  it('treats a decayed 100 as unfinished when updatedAt is old', () => {
    const mastery = { 'unit-a': 100, 'unit-b': 60 }
    const updatedAt = { 'unit-a': '2026-07-01', 'unit-b': TODAY } // 6 full weeks -> -12
    const next = nextLesson(units, mastery, updatedAt, TODAY)
    expect(next.unit.id).toBe('unit-a')
  })

  it('keeps a 100 unit closed when updated the same day', () => {
    const mastery = { 'unit-a': 100, 'unit-b': 60 }
    const updatedAt = { 'unit-a': TODAY, 'unit-b': TODAY }
    const next = nextLesson(units, mastery, updatedAt, TODAY)
    expect(next.unit.id).toBe('unit-b')
  })
})