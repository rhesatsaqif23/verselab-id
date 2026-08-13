import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LessonPage from './index'
import { useLessonStore } from '#/engine/player/lessonStore.ts'
import { useProgressStore, XP_PER_SCREEN, XP_PER_LESSON } from '#/engine/progress/progressStore.ts'
import { useLessonCompleteStore } from '#/features/lesson-complete/lessonCompleteStore.ts'
import type { Screen } from '#/engine/types.ts'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  Link: ({ to, params, children }: { to: string; params?: Record<string, string>; children: React.ReactNode }) => (
    <a href={params ? `${to}/${params.lessonId}` : to}>{children}</a>
  ),
}))

const fixtureScreens: Screen[] = [
  {
    type: 'choice',
    prompt: 'Pilihan ganda',
    options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    correctId: 'a',
    explain: 'A benar.',
  },
  {
    type: 'concept',
    prompt: 'Ini konsep.',
    explain: 'Penjelasan konsep.',
  },
  {
    type: 'numeric',
    prompt: 'Berapa hasilnya?',
    unit: 'angka',
    acceptRange: [4, 6],
    explain: 'Jawabannya 5.',
  },
]

vi.mock('#/content/index.ts', () => ({
  findLesson: () => ({
    unit: { id: 'unit-test', title: 'Unit Test', lessons: [] },
    lesson: { id: 'test-lesson', title: 'Test Lesson', screens: fixtureScreens },
  }),
}))

vi.mock('./renderScreen.tsx', () => ({
  renderScreen: (screen: Screen, onChange: (answer: unknown) => void) => {
    switch (screen.type) {
      case 'choice':
        return (
          <div>
            <p>{screen.prompt}</p>
            {screen.options.map((opt) => (
              <button key={opt.id} onClick={() => onChange(opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>
        )
      case 'concept':
        return <p>{screen.prompt}</p>
      case 'numeric':
        return (
          <div>
            <p>{screen.prompt}</p>
            <button onClick={() => onChange(5)}>Jawab 5</button>
            <button onClick={() => onChange(99)}>Jawab 99</button>
          </div>
        )
      default:
        return null
    }
  },
}))

vi.mock('./checkAnswer.ts', () => ({
  checkAnswer: (screen: Screen, answer: unknown) => {
    if (screen.type === 'choice') return answer === screen.correctId
    if (screen.type === 'numeric') {
      return typeof answer === 'number' && answer >= screen.acceptRange[0] && answer <= screen.acceptRange[1]
    }
    return false
  },
}))

beforeEach(() => {
  localStorage.clear()
  useLessonStore.getState().clear()
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: { 'unit-test': 50 },
    masteryUpdatedAt: {},
  })
  useLessonCompleteStore.getState().clear()
  navigateMock.mockReset()
})

describe('LessonPage award flow', () => {
  it('awards XP and mastery correctly, excludes concept from wrong list', async () => {
    render(<LessonPage lessonId="test-lesson" />)
    const user = userEvent.setup()

    // Screen 0: choice — answer correctly
    await user.click(screen.getByRole('button', { name: 'A' }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Screen 1: concept — auto-advance
    await user.click(screen.getByRole('button', { name: /lanjut/i }))

    // Screen 2: numeric — answer correctly
    await user.click(screen.getByRole('button', { name: 'Jawab 5' }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Assertions
    expect(navigateMock).toHaveBeenCalledWith({ to: '/lesson-complete' })

    const summary = useLessonCompleteStore.getState().summary
    expect(summary).not.toBeNull()

    // 2 answer screens, both correct → 2 * 10 + 50 = 70 XP
    expect(summary!.xpEarned).toBe(2 * XP_PER_SCREEN + XP_PER_LESSON)
    expect(summary!.correctCount).toBe(2)
    expect(summary!.totalScreens).toBe(2)

    // Concept screen must not appear in wrong list
    expect(summary!.wrongScreens.some((w) => w.prompt.includes('konsep'))).toBe(false)

    // Mastery: started at 50, +2 twice → 54
    expect(summary!.masteryBefore).toBe(50)
    expect(summary!.masteryAfter).toBe(54)

    // Store XP matches
    expect(useProgressStore.getState().xp).toBe(70)
  })

  it('records wrong answers and excludes concept from mastery penalties', async () => {
    render(<LessonPage lessonId="test-lesson" />)
    const user = userEvent.setup()

    // Screen 0: choice — answer wrong
    await user.click(screen.getByRole('button', { name: 'B' }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Screen 1: concept — auto-advance
    await user.click(screen.getByRole('button', { name: /lanjut/i }))

    // Screen 2: numeric — answer wrong (99 outside range)
    await user.click(screen.getByRole('button', { name: 'Jawab 99' }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const summary = useLessonCompleteStore.getState().summary
    expect(summary).not.toBeNull()

    // 0 correct → 0 * 10 + 50 = 50 XP
    expect(summary!.xpEarned).toBe(XP_PER_LESSON)
    expect(summary!.correctCount).toBe(0)
    expect(summary!.wrongScreens).toHaveLength(2)

    // Concept must not be in wrong list
    expect(summary!.wrongScreens.some((w) => w.prompt.includes('konsep'))).toBe(false)

    // Mastery: started at 50, -1 twice → 48
    expect(summary!.masteryBefore).toBe(50)
    expect(summary!.masteryAfter).toBe(48)
  })
})
