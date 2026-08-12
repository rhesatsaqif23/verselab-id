import { beforeEach, describe, expect, it } from 'vitest'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { findLesson, nextLesson, todayString, units } from './index'

const allMastered = (value: number) =>
  Object.fromEntries(units.map((u) => [u.id, value]))

beforeEach(() => {
  localStorage.clear()
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: {},
  })
})

describe('content helpers', () => {
  it('findLesson resolves the why-save-early lesson with its unit', () => {
    const found = findLesson('why-save-early')
    expect(found?.lesson.id).toBe('why-save-early')
    expect(found?.unit.id).toBe('bunga-berbunga')
  })

  it('findLesson returns undefined for an unknown lesson', () => {
    expect(findLesson('nope')).toBeUndefined()
  })

  it('nextLesson returns the first unfinished unit', () => {
    const next = nextLesson(units, allMastered(50))
    expect(next.unit.id).toBe('bunga-berbunga')
    expect(next.lesson.id).toBe('why-save-early')
  })

  it('nextLesson falls back to the first unit when all are mastered', () => {
    const next = nextLesson(units, allMastered(100))
    expect(next.unit.id).toBe('bunga-berbunga')
    expect(next.lesson.id).toBe('why-save-early')
  })

  it('todayString returns a YYYY-MM-DD date', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
