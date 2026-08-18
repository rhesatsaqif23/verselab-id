// Tests for streak computation rules.
import { describe, expect, it } from 'vitest'
import { streakOnActivity, type StreakState } from '#/engine/progress/streak.ts'

const empty: StreakState = { streak: 0, streakFreeze: 0, lastActiveDate: null }

describe('streakOnActivity', () => {
  it('first ever activity sets streak to 1', () => {
    expect(streakOnActivity(empty, '2026-08-12')).toEqual({
      streak: 1,
      streakFreeze: 0,
      lastActiveDate: '2026-08-12',
    })
  })

  it('same-day activity does not change streak', () => {
    const state = streakOnActivity(empty, '2026-08-12')
    expect(streakOnActivity(state, '2026-08-12')).toEqual(state)
  })

  it('consecutive day increments the streak', () => {
    const state = streakOnActivity(empty, '2026-08-12')
    const next = streakOnActivity(state, '2026-08-13')
    expect(next.streak).toBe(2)
    expect(next.lastActiveDate).toBe('2026-08-13')
  })

  it('seven consecutive days earns one freeze', () => {
    let state = streakOnActivity(empty, '2026-08-12')
    for (let i = 1; i < 7; i++) {
      state = streakOnActivity(state, `2026-08-${String(12 + i).padStart(2, '0')}`)
    }
    expect(state.streak).toBe(7)
    expect(state.streakFreeze).toBe(1)
  })

  it('fourteen consecutive days earns a second freeze', () => {
    let state = empty
    for (let i = 0; i < 14; i++) {
      const d = new Date(2026, 7, 12 + i)
      state = streakOnActivity(state, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    }
    expect(state.streak).toBe(14)
    expect(state.streakFreeze).toBe(2)
  })

  it('missed a day with freeze available keeps the streak and consumes one freeze', () => {
    let state = empty
    for (let i = 0; i < 7; i++) {
      const d = new Date(2026, 7, 12 + i)
      state = streakOnActivity(state, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    }
    expect(state.streakFreeze).toBe(1)

    const afterMiss = streakOnActivity(state, '2026-08-20')
    expect(afterMiss.streak).toBe(7)
    expect(afterMiss.streakFreeze).toBe(0)
    expect(afterMiss.lastActiveDate).toBe('2026-08-20')
  })

  it('missed a day without freeze resets the streak to 1', () => {
    const state = streakOnActivity(empty, '2026-08-12')
    const afterMiss = streakOnActivity(state, '2026-08-15')
    expect(afterMiss.streak).toBe(1)
    expect(afterMiss.streakFreeze).toBe(0)
    expect(afterMiss.lastActiveDate).toBe('2026-08-15')
  })
})
