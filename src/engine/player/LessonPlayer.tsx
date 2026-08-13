import type { ReactNode } from 'react'
import { Button } from '#/components/ui/button.tsx'
import type { Screen } from '#/engine/types.ts'
import { useLessonStore } from './lessonStore.ts'

export type AnswerResult = {
  screen: Screen
  correct: boolean
}

type LessonPlayerProps = {
  screens: readonly Screen[]
  renderScreen: (screen: Screen, onChange: (answer: unknown) => void, checked: boolean | null) => ReactNode
  checkAnswer: (screen: Screen, answer: unknown) => boolean
  onExit: () => void
  onComplete: (results: readonly AnswerResult[]) => void
  xpEarned: number
}

export default function LessonPlayer({
  screens,
  renderScreen,
  checkAnswer,
  onExit,
  onComplete,
  xpEarned,
}: LessonPlayerProps) {
  const index = useLessonStore((s) => s.index)
  const answers = useLessonStore((s) => s.answers)
  const results = useLessonStore((s) => s.results)
  const setAnswer = useLessonStore((s) => s.setAnswer)
  const checkResult = useLessonStore((s) => s.checkResult)
  const next = useLessonStore((s) => s.next)
  const clear = useLessonStore((s) => s.clear)

  const screen = screens[index]
  const total = screens.length
  const answer = answers[index]
  const hasAnswer = answer !== null && answer !== undefined
  const lastResult = results[index]
  const phase = lastResult ? 'checked' : 'answering'
  const isConcept = screen.type === 'concept'

  function handleCheck() {
    const correct = checkAnswer(screen, answer)
    checkResult(index, correct)
  }

  function handleContinue() {
    const nextIndex = index + 1
    if (nextIndex >= total) {
      const finalResults = screens.flatMap((s, i) =>
        results[i] ? [{ screen: s, correct: results[i]!.correct }] : [],
      )
      onComplete(finalResults)
      clear()
      return
    }
    next()
  }

  function handleExit() {
    onExit()
    clear()
  }

  return (
    <div className="page-wrap flex min-h-screen flex-col px-4 pb-16 pt-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="icon" onClick={handleExit} aria-label="Keluar" className="shrink-0">
          ✕
        </Button>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex gap-1.5">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-full transition-colors ${
                  i <= index ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <span className="text-center text-lg font-bold text-muted">
            {index + 1} / {total}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-bold text-foreground">
          <span>{xpEarned}</span>
          <span className="text-sm font-bold text-muted">XP</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col py-6">
        <div key={index} className="my-auto flex w-full flex-col justify-center py-4">
          {renderScreen(
            screen,
            (a) => setAnswer(index, a),
            phase === 'checked' && lastResult ? lastResult.correct : null,
          )}
        </div>

        <div className="w-full flex min-h-20 flex-col gap-3 pt-4">
          {isConcept ? (
            <Button
              variant="default"
              size="lg"
              onClick={handleContinue}
              className="w-full"
            >
              Lanjut
            </Button>
          ) : phase === 'checked' && lastResult ? (
            <div
              role="status"
              className="rounded-2xl border-2 border-border bg-card p-4 sm:p-5"
            >
              <p className="text-base font-medium leading-relaxed text-foreground">
                {screen.explain}
              </p>
            </div>
          ) : null}

          {!isConcept && (phase === 'answering' ? (
            <Button
              variant="default"
              size="lg"
              disabled={!hasAnswer}
              onClick={handleCheck}
              className="w-full disabled:opacity-100"
            >
              Cek Jawaban
            </Button>
          ) : (
            <Button variant="default" size="lg" onClick={handleContinue} className="w-full">
              Lanjut
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
