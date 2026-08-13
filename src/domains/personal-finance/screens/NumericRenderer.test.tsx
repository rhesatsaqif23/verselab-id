import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NumericRenderer from './NumericRenderer'
import type { Screen } from '#/engine/types.ts'

const demoScreen: Extract<Screen, { type: 'numeric' }> = {
  type: 'numeric' as const,
  prompt:
    'Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Setelah 10 tahun, total tabungan kamu jadi berapa?',
  unit: 'juta rupiah',
  acceptRange: [80, 84],
  explain: 'Setoran kamu totalnya cuma 60 juta, tapi jadi sekitar 82 juta.',
}

describe('NumericRenderer', () => {
  it('renders the prompt and the unit text', () => {
    render(<NumericRenderer screen={demoScreen} onChange={() => {}} checked={null} />)
    expect(screen.getByText(demoScreen.prompt)).toBeInTheDocument()
    expect(screen.getByText('juta rupiah')).toBeInTheDocument()
  })

  it('calls onChange with the parsed number when typing', async () => {
    const onChange = vi.fn()
    render(<NumericRenderer screen={demoScreen} onChange={onChange} checked={null} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), '82')
    expect(onChange).toHaveBeenLastCalledWith(82)
  })

  it('calls onChange(null) when the input is cleared', async () => {
    const onChange = vi.fn()
    render(<NumericRenderer screen={demoScreen} onChange={onChange} checked={null} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), '82')
    await user.clear(screen.getByRole('textbox'))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('parses numbers with thousands separators', async () => {
    const onChange = vi.fn()
    render(<NumericRenderer screen={demoScreen} onChange={onChange} checked={null} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), '81.939')
    expect(onChange).toHaveBeenLastCalledWith(81939)
  })

  it('parses comma as decimal separator', async () => {
    const onChange = vi.fn()
    render(<NumericRenderer screen={demoScreen} onChange={onChange} checked={null} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), '82,5')
    expect(onChange).toHaveBeenLastCalledWith(82.5)
  })

  it('ignores non-numeric input', async () => {
    const onChange = vi.fn()
    render(<NumericRenderer screen={demoScreen} onChange={onChange} checked={null} />)
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox'), 'abc')
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })
})
