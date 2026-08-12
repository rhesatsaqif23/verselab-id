import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConceptRenderer from './ConceptRenderer'

const demoScreen = {
  type: 'concept' as const,
  prompt:
    'Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.',
  explain: 'Bunga berbunga membuat tabungan tumbuh semakin cepat seiring waktu.',
}

describe('ConceptRenderer', () => {
  it('renders the prompt text', () => {
    render(<ConceptRenderer screen={demoScreen} onContinue={() => {}} />)
    expect(screen.getByText(demoScreen.prompt)).toBeInTheDocument()
  })

  it('renders a Lanjut button', () => {
    render(<ConceptRenderer screen={demoScreen} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /lanjut/i })).toBeInTheDocument()
  })

  it('calls onContinue when Lanjut is pressed', async () => {
    const onContinue = vi.fn()
    render(<ConceptRenderer screen={demoScreen} onContinue={onContinue} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /lanjut/i }))
    expect(onContinue).toHaveBeenCalledTimes(1)
  })

  it('keeps the button enabled', () => {
    render(<ConceptRenderer screen={demoScreen} onContinue={() => {}} />)
    expect(screen.getByRole('button', { name: /lanjut/i })).toBeEnabled()
  })
})
