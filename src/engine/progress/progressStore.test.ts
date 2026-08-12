import { beforeEach, describe, expect, it } from 'vitest'
import {
  MASTERY_MAX,
  MASTERY_MIN,
  MASTERY_WRONG,
  XP_PER_LESSON,
  XP_PER_SCREEN,
  useProgressStore,
} from './progressStore'

const store = () => useProgressStore.getState()

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

describe('useProgressStore', () => {
  it('awardXp increases xp', () => {
    store().awardXp(10)
    expect(store().xp).toBe(10)
  })

  it('awardXp never goes below zero', () => {
    store().awardXp(-100)
    expect(store().xp).toBe(0)
  })

  it('awardScreenResult(true) adds XP and raises mastery', () => {
    store().awardScreenResult('unit-a', true)
    expect(store().xp).toBe(XP_PER_SCREEN)
    expect(store().mastery['unit-a']).toBe(52)
  })

  it('awardScreenResult(true) caps mastery at 100', () => {
    useProgressStore.setState({ mastery: { 'unit-a': MASTERY_MAX } })
    store().awardScreenResult('unit-a', true)
    expect(store().mastery['unit-a']).toBe(MASTERY_MAX)
  })

  it('awardScreenResult(false) lowers mastery without touching XP', () => {
    store().awardScreenResult('unit-a', false)
    expect(store().xp).toBe(0)
    expect(store().mastery['unit-a']).toBe(50 - MASTERY_WRONG)
  })

  it('awardScreenResult(false) floors mastery at 0', () => {
    useProgressStore.setState({ mastery: { 'unit-a': MASTERY_MIN } })
    store().awardScreenResult('unit-a', false)
    expect(store().mastery['unit-a']).toBe(MASTERY_MIN)
  })

  it('awardLessonCompletion adds the bonus XP and registers activity', () => {
    store().awardLessonCompletion('unit-a')
    expect(store().xp).toBe(XP_PER_LESSON)
    expect(store().streak).toBe(1)
    expect(store().lastActiveDate).not.toBeNull()
    expect(store().mastery['unit-a']).toBe(50)
  })

  it('setDailyGoal updates the setting', () => {
    store().setDailyGoal(20)
    expect(store().dailyGoalMinutes).toBe(20)
  })

  it('persists state to localStorage', () => {
    store().awardXp(60)
    store().setDailyGoal(20)
    store().awardLessonCompletion('unit-a')
    const raw = localStorage.getItem('verselab-progress-v1')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.xp).toBe(60 + XP_PER_LESSON)
    expect(parsed.state.dailyGoalMinutes).toBe(20)
    expect(parsed.state.streak).toBe(1)
  })
})
