// Tests for the home dashboard cards.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StreakTracker from '#/features/home/components/StreakTracker.tsx'
import DailyGoalCard from '#/features/home/components/DailyGoalCard.tsx'
import CourseCard from '#/features/home/components/CourseCard.tsx'
import CourseGrid from '#/features/home/components/CourseGrid.tsx'
import { resetProgress, setMastery } from '../test-utils'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/libs/date.ts'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
  Link: ({ to, params, children }: { to: string; params?: Record<string, string>; children: React.ReactNode }) => (
    <a
      href={params ? `${to}/${params.lessonId}` : to}
      onClick={(e) => {
        e.preventDefault()
        if (params) navigateMock({ to, params })
        else navigateMock({ to })
      }}
    >
      {children}
    </a>
  ),
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
    expect(screen.getByText(/Tercapai hari ini/)).toBeInTheDocument()
  })

  it('shows not reached when lastActiveDate is not today', () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: null })
    render(<DailyGoalCard />)
    expect(screen.getByText('Belum tercapai')).toBeInTheDocument()
    expect(screen.getByText('Goal harian')).toBeInTheDocument()
  })

  it('shows the minutes done against the daily goal', () => {
    useProgressStore.setState({ dailyGoalMinutes: 10, lastActiveDate: todayString() })
    render(<DailyGoalCard />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('/ 10 menit')).toBeInTheDocument()
  })

  it('links to the profile page to set the daily goal', () => {
    render(<DailyGoalCard />)
    expect(screen.getByRole('link', { name: /atur goal harian/i })).toHaveAttribute('href', '/profile')
  })
})

describe('CourseCard', () => {
  it('renders the next lesson title and a continue link', () => {
    setMastery(0)
    render(<CourseCard />)
    expect(screen.getByText('Kenapa nabung lebih awal jauh lebih untung')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /lanjut ke lesson berikutnya/i })
    ).toBeInTheDocument()
  })

  it('navigates to the next lesson when clicked', async () => {
    setMastery(0)
    render(<CourseCard />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: /lanjut ke lesson berikutnya/i }))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'nabung-awal' },
    })
  })
})

describe('CourseGrid', () => {
  it('renders unit titles', () => {
    setMastery(35)
    render(<CourseGrid />)
    expect(screen.getByText('Keuangan')).toBeInTheDocument()
    expect(screen.getByText('Akuntansi')).toBeInTheDocument()
    expect(screen.getByText('Manajemen Produk')).toBeInTheDocument()
    expect(screen.getByText('Kewirausahaan')).toBeInTheDocument()
  })

  it('navigates to the unit first lesson when clicked', async () => {
    setMastery(0)
    render(<CourseGrid />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Keuangan'))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'nabung-awal' },
    })
  })
})
