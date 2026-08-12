import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LessonPlayer from './LessonPlayer'
import type { Screen } from '#/engine/types.ts'

const screens: Screen[] = [
  {
    type: 'choice',
    prompt: 'Pertanyaan pertama',
    options: [
      { id: 'a', label: 'Opsi A' },
      { id: 'b', label: 'Opsi B' },
    ],
    correctId: 'a',
    explain: 'Karena A benar.',
  },
  {
    type: 'choice',
    prompt: 'Pertanyaan kedua',
    options: [
      { id: 'a', label: 'Opsi C' },
      { id: 'b', label: 'Opsi D' },
    ],
    correctId: 'b',
    explain: 'Karena D benar.',
  },
]

function renderScreen(
  screen: Screen,
  onChange: (answer: unknown) => void
): React.ReactNode {
  return (
    <div>
      <p>{screen.type === 'choice' ? screen.prompt : ''}</p>
      {screen.type === 'choice' &&
        screen.options.map((option) => (
          <button key={option.id} onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        ))}
    </div>
  )
}

function checkAnswer(screen: Screen, answer: unknown): boolean {
  return screen.type === 'choice' && answer === screen.correctId
}

describe('LessonPlayer', () => {
  it('shows 1 / N and a progress bar at start', () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('starts with the Check button disabled', () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    expect(screen.getByRole('button', { name: /check/i })).toBeDisabled()
  })

  it('enables Check after an answer is selected', async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /opsi a/i }))
    expect(screen.getByRole('button', { name: /check/i })).toBeEnabled()
  })

  it('shows the feedback panel with explain text after Check', async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /opsi a/i }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByText(/karena a benar/i)).toBeInTheDocument()
  })

  it('switches the button to Continue in the same position after Check', async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /opsi a/i }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /check/i })).not.toBeInTheDocument()
  })

  it('advances to the next screen on Continue', async () => {
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /opsi a/i }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByText('Pertanyaan kedua')).toBeInTheDocument()
  })

  it('calls onComplete with results on the last screen', async () => {
    const onComplete = vi.fn()
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={() => {}}
        onComplete={onComplete}
      />
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /opsi a/i }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.click(screen.getByRole('button', { name: /opsi c/i }))
    await user.click(screen.getByRole('button', { name: /check/i }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ correct: true }),
        expect.objectContaining({ correct: false }),
      ])
    )
  })

  it('calls onExit when the exit button is clicked', async () => {
    const onExit = vi.fn()
    render(
      <LessonPlayer
        screens={screens}
        renderScreen={renderScreen}
        checkAnswer={checkAnswer}
        onExit={onExit}
        onComplete={() => {}}
      />
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /keluar/i }))
    expect(onExit).toHaveBeenCalledTimes(1)
  })
})
