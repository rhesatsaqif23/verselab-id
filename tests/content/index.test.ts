// Tests for content lookup helpers.
import { describe, expect, it } from 'vitest'
import { findLesson } from '#/content/index.ts'
import { todayString } from '#/libs/date.ts'

describe('content helpers', () => {
it('findLesson resolves the nabung-awal lesson with its keuangan unit', () => {
    const found = findLesson('nabung-awal')
    expect(found?.lesson.id).toBe('nabung-awal')
    expect(found?.unit.id).toBe('keuangan')
  })

  it('findLesson returns undefined for an unknown lesson', () => {
    expect(findLesson('nope')).toBeUndefined()
  })

  it('todayString returns a YYYY-MM-DD date', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
