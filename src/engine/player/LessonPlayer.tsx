import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '#/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import type { Screen } from '#/engine/types.ts'
import ProgressBar from './ProgressBar.tsx'
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

  const [explainOpen, setExplainOpen] = useState(false)

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
    setExplainOpen(false)
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
    <div className="flex min-h-screen w-full flex-col px-6 py-6">
      <div className="flex gap-4 md:gap-16">
        <Button variant="ghost" size="icon" onClick={handleExit} aria-label="Keluar" className="shrink-0">
          ✕
        </Button>
        <ProgressBar current={index + 1} total={total} />
        <div className="shrink-0 flex items-center gap-1 rounded-full border-2 border-border px-3 py-1.5 text-md font-bold text-foreground">
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

        <div className="mx-auto w-full max-w-md flex min-h-20 flex-col gap-3 pt-4">
          {isConcept ? (
            <Button
              variant="default"
              size="lg"
              onClick={handleContinue}
              className="w-full"
            >
              Lanjut
            </Button>
          ) : phase === 'answering' ? (
            <Button
              variant="default"
              size="lg"
              disabled={!hasAnswer}
              onClick={handleCheck}
              className="w-full disabled:opacity-60"
            >
              Cek Jawaban
            </Button>
          ) : (
            <div className="flex gap-3">
              {screen.explain && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setExplainOpen(true)}
                  className="shrink-0"
                >
                  Kenapa?
                </Button>
              )}
              <Button
                variant="default"
                size="lg"
                onClick={handleContinue}
                className="flex-1"
              >
                Lanjut
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Explanation Dialog */}
      <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Penjelasan</DialogTitle>
          </DialogHeader>
          <p className="text-base leading-relaxed text-foreground">
            {screen.explain}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

