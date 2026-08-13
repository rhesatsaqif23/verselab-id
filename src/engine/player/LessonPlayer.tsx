import type { ReactNode } from 'react'
import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'
import { Progress } from '#/components/ui/progress.tsx'
import type { Screen } from '#/engine/types.ts'
import { useLessonStore } from './lessonStore.ts'

export type AnswerResult = {
  screen: Screen
  correct: boolean
}

type LessonPlayerProps = {
  screens: readonly Screen[]
  renderScreen: (screen: Screen, onChange: (answer: unknown) => void) => ReactNode
  checkAnswer: (screen: Screen, answer: unknown) => boolean
  onExit: () => void
  onComplete: (results: readonly AnswerResult[]) => void
}

export default function LessonPlayer({
  screens,
  renderScreen,
  checkAnswer,
  onExit,
  onComplete,
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleExit} aria-label="Keluar">
          ✕
        </Button>
        <span className="shrink-0 text-sm text-muted">
          {index + 1} / {total}
        </span>
        <Progress value={((index + 1) / total) * 100} className="h-2" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col py-8">
        <div key={index}>{renderScreen(screen, (a) => setAnswer(index, a))}</div>

        <div className="mt-auto flex min-h-28 flex-col gap-3 pt-6">
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
              className={cn(
                'rounded-2xl border-2 px-4 py-3 text-sm',
                lastResult.correct
                  ? 'border-success bg-success/10 text-success'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              )}
            >
              <p className="font-bold">
                {lastResult.correct ? 'Benar!' : 'Belum tepat'}
              </p>
              <p className="mt-1 text-muted">{screen.explain}</p>
            </div>
          ) : null}

          {!isConcept && (phase === 'answering' ? (
            <Button
              variant="default"
              size="lg"
              disabled={!hasAnswer}
              onClick={handleCheck}
              className="w-full"
            >
              Check
            </Button>
          ) : (
            <Button variant="default" size="lg" onClick={handleContinue} className="w-full">
              Continue
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
