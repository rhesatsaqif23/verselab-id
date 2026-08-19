// Tests for the home dashboard cards.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StreakTracker from '#/features/home/components/StreakTracker.tsx'
import DailyGoalCard from '#/features/home/components/DailyGoalCard.tsx'
import UnitCard from '#/features/home/components/UnitCard.tsx'
import ShuffleCard from '#/features/home/components/ShuffleCard.tsx'
import UnitGrid from '#/features/home/components/UnitGrid.tsx'
import { useHomeStore } from '#/features/home/store.ts'
import { units } from '#/content/index.ts'
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
  useHomeStore.setState({ selectedUnitId: 'keuangan' })
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

describe('UnitCard', () => {
  it('renders the next lesson title and a continue link', () => {
    setMastery(0)
    render(<UnitCard unit={units[0]} />)
    expect(screen.getByText('Kenapa nabung lebih awal jauh lebih untung')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /lanjut ke lesson berikutnya/i })
    ).toBeInTheDocument()
  })

  it('navigates to the next lesson when clicked', async () => {
    setMastery(0)
    render(<UnitCard unit={units[1]} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: /lanjut ke lesson berikutnya/i }))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'persamaan' },
    })
  })
})

describe('ShuffleCard', () => {
  it('renders the selected unit from the home store', () => {
    setMastery(100)
    act(() => useHomeStore.setState({ selectedUnitId: 'akuntansi' }))
    render(<ShuffleCard />)
    expect(screen.getByText('Persamaan dasar: aset, utang, dan modal')).toBeInTheDocument()
    expect(screen.getByText('Akuntansi')).toBeInTheDocument()
  })

  it('renders a card for the selected unit over stacked deck layers', () => {
    setMastery(100)
    render(<ShuffleCard />)
    expect(
      screen.getByRole('link', { name: /lanjut ke lesson berikutnya/i })
    ).toBeInTheDocument()
  })
})

describe('UnitGrid', () => {
  it('renders unit titles', () => {
    setMastery(35)
    render(<UnitGrid />)
    expect(screen.getByText('Keuangan')).toBeInTheDocument()
    expect(screen.getByText('Akuntansi')).toBeInTheDocument()
    expect(screen.getByText('Manajemen Produk')).toBeInTheDocument()
    expect(screen.getByText('Kewirausahaan')).toBeInTheDocument()
  })

  it('selecting a unit changes the hero ShuffleCard', async () => {
    setMastery(100)
    render(
      <>
        <ShuffleCard />
        <UnitGrid />
      </>
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('Akuntansi'))
    expect(useHomeStore.getState().selectedUnitId).toBe('akuntansi')
    expect(
      screen.getAllByRole('link', { name: /lanjut ke lesson berikutnya/i }).length
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Persamaan dasar: aset, utang, dan modal').length).toBeGreaterThan(0)
  })
})