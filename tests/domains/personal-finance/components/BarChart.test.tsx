// Render tests for the BarChart component.
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import BarChart from '#/domains/personal-finance/components/BarChart.tsx'

const data = [
  { label: '10 tahun', value: 81_939_673 },
  { label: '20 tahun', value: 197_655_425 },
]

function getBars(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[data-testid="bar-chart-bar"]')) as HTMLElement[]
}

describe('BarChart', () => {
  it('renders one bar per datum', () => {
    render(<BarChart data={data} />)
    expect(getBars()).toHaveLength(data.length)
  })

  it('renders the label text for each datum', () => {
    render(<BarChart data={data} />)
    expect(screen.getByText('10 tahun')).toBeInTheDocument()
    expect(screen.getByText('20 tahun')).toBeInTheDocument()
  })

  it('renders the formatted value for each datum', () => {
    render(<BarChart data={data} />)
    expect(screen.getByText('81.939.673')).toBeInTheDocument()
    expect(screen.getByText('197.655.425')).toBeInTheDocument()
  })

  it('sets the tallest bar to 100% height', () => {
    render(<BarChart data={data} />)
    const heights = getBars().map((bar) => bar.style.height)
    expect(heights).toContain('100%')
  })

  it('scales smaller bars proportionally', () => {
    render(<BarChart data={data} />)
    const heights = getBars().map((bar) => parseFloat(bar.style.height))
    const ratio = heights[0] / heights[1]
    expect(ratio).toBeCloseTo(data[0].value / data[1].value, 5)
  })
})
