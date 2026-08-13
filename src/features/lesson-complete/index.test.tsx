import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import LessonCompletePage from './index'
import { useLessonCompleteStore, type LessonCompleteSummary } from './lessonCompleteStore'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children }: { to: string; params?: Record<string, string>; children: React.ReactNode }) => (
    <a href={params ? `${to}/${params.lessonId}` : to}>{children}</a>
  ),
}))

const summary: LessonCompleteSummary = {
  unitId: 'saving-basics',
  unitName: 'Dasar Menabung',
  totalScreens: 4,
  correctCount: 3,
  wrongScreens: [
    { prompt: 'Berapa bunga 5 juta setahun?', explain: 'Pakai rumus bunga sederhana.' },
  ],
  xpEarned: 80,
  masteryBefore: 50,
  masteryAfter: 52,
}

function renderPage() {
  return render(<LessonCompletePage />)
}

beforeEach(() => {
  useLessonCompleteStore.getState().clear()
})

describe('lessonCompleteStore', () => {
  it('setSummary stores a summary and clear removes it', () => {
    const store = useLessonCompleteStore.getState()
    store.setSummary(summary)
    expect(useLessonCompleteStore.getState().summary).toEqual(summary)
    useLessonCompleteStore.getState().clear()
    expect(useLessonCompleteStore.getState().summary).toBeNull()
  })
})

describe('LessonCompletePage', () => {
  it('renders the completion header and back link', () => {
    useLessonCompleteStore.getState().setSummary(summary)
    renderPage()
    expect(screen.getByText('Lesson selesai!')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /kembali ke beranda/i })).toBeInTheDocument()
  })

  it('shows the XP earned', () => {
    useLessonCompleteStore.getState().setSummary(summary)
    renderPage()
    expect(screen.getByText(/\+80/)).toBeInTheDocument()
    expect(screen.getAllByText('XP').length).toBeGreaterThan(0)
  })

  it('shows mastery before and after with the delta', () => {
    useLessonCompleteStore.getState().setSummary(summary)
    renderPage()
    const mastery = screen.getByText((_, element) =>
      Boolean(element?.classList.contains('text-3xl'))
    )
    expect(mastery.textContent).toMatch(/50\s*→\s*52/)
    expect(mastery.textContent).toContain('+2')
  })

  it('lists the wrong screens with prompt and explain', () => {
    useLessonCompleteStore.getState().setSummary(summary)
    renderPage()
    expect(screen.getByText('Berapa bunga 5 juta setahun?')).toBeInTheDocument()
    expect(screen.getByText('Pakai rumus bunga sederhana.')).toBeInTheDocument()
    expect(screen.getByText('Perlu diulang')).toBeInTheDocument()
  })

  it('shows the all-correct state when no screens were wrong', () => {
    useLessonCompleteStore.getState().setSummary({ ...summary, wrongScreens: [] })
    renderPage()
    expect(screen.getByText('Semua benar!')).toBeInTheDocument()
    expect(screen.queryByText('Perlu diulang')).not.toBeInTheDocument()
  })

  it('shows the fallback message when there is no summary', () => {
    renderPage()
    expect(screen.getByText('Belum ada lesson yang selesai')).toBeInTheDocument()
  })

  it('has a back link to home', () => {
    useLessonCompleteStore.getState().setSummary(summary)
    renderPage()
    const backLink = screen.getByRole('link', { name: /kembali ke beranda/i })
    expect(backLink).toHaveAttribute('href', '/')
  })
})
