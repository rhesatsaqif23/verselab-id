import { describe, expect, it } from 'vitest'
import { isUnitStarted, masteryForDisplay } from './masteryRead'

const TODAY = '2026-08-13'

describe('isUnitStarted', () => {
  it('returns false for a missing unit', () => {
    expect(isUnitStarted('unit-a', {})).toBe(false)
  })

  it('returns true for a unit with a mastery entry', () => {
    expect(isUnitStarted('unit-a', { 'unit-a': 50 })).toBe(true)
  })

  it('returns true for a unit with zero mastery', () => {
    expect(isUnitStarted('unit-a', { 'unit-a': 0 })).toBe(true)
  })
})

describe('masteryForDisplay', () => {
  it('returns 0 when the unit is not started', () => {
    expect(masteryForDisplay('unit-a', {}, {}, TODAY)).toBe(0)
  })

  it('returns the raw value when updated the same day', () => {
    expect(masteryForDisplay('unit-a', { 'unit-a': 60 }, { 'unit-a': TODAY }, TODAY)).toBe(60)
  })

  it('returns the decayed value, not the raw value', () => {
    const updatedAt = '2026-08-05' // 8 days ago -> 1 full week -> -2
    expect(masteryForDisplay('unit-a', { 'unit-a': 60 }, { 'unit-a': updatedAt }, TODAY)).toBe(58)
  })

  it('floors the decayed value at zero', () => {
    const updatedAt = '2026-08-05'
    expect(masteryForDisplay('unit-a', { 'unit-a': 1 }, { 'unit-a': updatedAt }, TODAY)).toBe(0)
  })

  it('returns raw when the unit has no updatedAt entry', () => {
    expect(masteryForDisplay('unit-a', { 'unit-a': 60 }, {}, TODAY)).toBe(60)
  })
})