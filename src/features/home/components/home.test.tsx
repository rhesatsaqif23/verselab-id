import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StreakTracker from './StreakTracker'
import DailyGoalCard from './DailyGoalCard'
import CourseCard from './CourseCard'
import CourseGrid from './CourseGrid'
import { resetProgress, setMastery } from '../test-utils'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/content/index.ts'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}))

beforeEach(() => {
  resetProgress()
  navigateMock.mockReset()
})

describe('StreakTracker', () => {
  it('renders the real streak from the progress store', () => {
    useProgressStore.setState({ streak: 7 })
    render(<StreakTracker />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

describe('DailyGoalCard', () => {
  it('shows reached when lastActiveDate is today', () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: todayString() })
    render(<DailyGoalCard />)
    expect(screen.getByText('Tercapai hari ini')).toBeInTheDocument()
  })

  it('shows not reached when lastActiveDate is not today', () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: null })
    render(<DailyGoalCard />)
    expect(screen.getByText('Belum tercapai')).toBeInTheDocument()
    expect(screen.getByText('10 menit')).toBeInTheDocument()
  })
})

describe('CourseCard', () => {
  it('renders the next lesson title and a continue button', () => {
    setMastery(0)
    render(<CourseCard />)
    expect(screen.getByText('Kenapa nabung lebih awal jauh lebih untung')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /lanjut ke lesson berikutnya/i })
    ).toBeInTheDocument()
  })

  it('navigates to the next lesson when clicked', async () => {
    setMastery(0)
    render(<CourseCard />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /lanjut ke lesson berikutnya/i }))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'why-save-early' },
    })
  })
})

describe('CourseGrid', () => {
  it('renders unit titles and mastery percentages', () => {
    setMastery(35)
    render(<CourseGrid />)
    expect(screen.getByText('Bunga berbunga')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument()
  })

  it('shows 0% when a unit has no mastery yet', () => {
    setMastery(0)
    render(<CourseGrid />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('navigates to the unit first lesson when clicked', async () => {
    setMastery(0)
    render(<CourseGrid />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Bunga berbunga'))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'why-save-early' },
    })
  })
})
