import { describe, expect, it } from 'vitest'
import { findLesson, todayString } from './index'

describe('content helpers', () => {
  it('findLesson resolves the why-save-early lesson with its unit', () => {
    const found = findLesson('why-save-early')
    expect(found?.lesson.id).toBe('why-save-early')
    expect(found?.unit.id).toBe('bunga-berbunga')
  })

  it('findLesson returns undefined for an unknown lesson', () => {
    expect(findLesson('nope')).toBeUndefined()
  })

  it('todayString returns a YYYY-MM-DD date', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
