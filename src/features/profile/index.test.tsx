import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from './index'
import { useProgressStore } from '#/engine/progress/progressStore.ts'

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
  localStorage.clear()
  useProgressStore.setState({
    xp: 0,
    dailyGoalMinutes: 10,
    streak: 0,
    streakFreeze: 0,
    lastActiveDate: null,
    mastery: {},
    masteryUpdatedAt: {},
  })
  navigateMock.mockReset()
})

describe('ProfilePage', () => {
  it('shows total XP', () => {
    useProgressStore.setState({ xp: 250 })
    render(<ProfilePage />)
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('Total XP')).toBeInTheDocument()
  })

  it('shows streak and freeze count', () => {
    useProgressStore.setState({ streak: 7, streakFreeze: 1 })
    render(<ProfilePage />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument()
    expect(screen.getByText('Streak + Freeze')).toBeInTheDocument()
  })

  it('shows zero for a fresh user', () => {
    render(<ProfilePage />)
    expect(screen.getAllByText('0')).toHaveLength(2)
    expect(screen.getByText('Total XP')).toBeInTheDocument()
  })

  it('renders per-unit mastery bars with decayed values', () => {
    useProgressStore.setState({
      mastery: { 'bunga-berbunga': 60 },
      masteryUpdatedAt: { 'bunga-berbunga': '2026-08-13' },
    })
    render(<ProfilePage />)
    expect(screen.getByText('Bunga berbunga')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('shows 0% for untouched units', () => {
    render(<ProfilePage />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('navigates to the unit lesson when clicked', async () => {
    render(<ProfilePage />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Bunga berbunga'))
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/lesson/$lessonId',
      params: { lessonId: 'why-save-early' },
    })
  })
})
