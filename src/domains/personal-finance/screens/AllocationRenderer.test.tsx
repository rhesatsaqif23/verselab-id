import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AllocationRenderer from './AllocationRenderer'
import type { Screen } from '#/engine/types.ts'

const demoScreen: Extract<Screen, { type: 'allocation' }> = {
  type: 'allocation',
  prompt: 'Gaji kamu 5 juta per bulan. Bagi ke tiga pos, dengan syarat tabungan minimal 20%.',
  categories: ['Kebutuhan', 'Keinginan', 'Tabungan'],
  rule: { category: 'Tabungan', min: 20 },
  explain: '20% dari 5 juta itu 1 juta per bulan.',
}

function sumAllocation(allocation: Record<string, number>): number {
  return Object.values(allocation).reduce((acc, v) => acc + v, 0)
}

describe('AllocationRenderer', () => {
  it('renders the prompt and all category labels', () => {
    render(<AllocationRenderer screen={demoScreen} onChange={() => {}} />)
    expect(screen.getByText(demoScreen.prompt)).toBeInTheDocument()
    expect(screen.getAllByText('Kebutuhan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Keinginan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tabungan').length).toBeGreaterThan(0)
  })

  it('renders a BarChart', () => {
    render(<AllocationRenderer screen={demoScreen} onChange={() => {}} />)
    expect(document.querySelectorAll('.bg-chart-1')).toHaveLength(3)
  })

  it('keeps the total at 100 when a slider moves', () => {
    const onChange = vi.fn()
    render(<AllocationRenderer screen={demoScreen} onChange={onChange} />)

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)

    fireEvent.keyDown(sliders[2], { key: 'ArrowRight' })
    fireEvent.keyDown(sliders[2], { key: 'ArrowRight' })
    fireEvent.keyDown(sliders[0], { key: 'ArrowRight' })

    for (const call of onChange.mock.calls) {
      expect(sumAllocation(call[0] as Record<string, number>)).toBe(100)
    }
  })

  it('sends a Record<category, number> to onChange', () => {
    const onChange = vi.fn()
    render(<AllocationRenderer screen={demoScreen} onChange={onChange} />)

    fireEvent.keyDown(screen.getAllByRole('slider')[1], { key: 'ArrowRight' })

    expect(onChange).toHaveBeenCalled()
    const payload = onChange.mock.calls[0][0] as Record<string, number>
    expect(Object.keys(payload).sort()).toEqual(['Kebutuhan', 'Keinginan', 'Tabungan'])
  })
})
