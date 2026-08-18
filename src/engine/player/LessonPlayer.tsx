// LessonPlayer: subject-agnostic lesson UI wiring screens, answers, and completion.
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Screen } from '#/engine/types.ts'
import ExplanationDialog from './ExplanationDialog.tsx'
import LessonControls from './LessonControls.tsx'
import LessonHeader from './LessonHeader.tsx'
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
      <LessonHeader
        current={index + 1}
        total={total}
        xpEarned={xpEarned}
        onExit={handleExit}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col py-6">
        <div key={index} className="my-auto flex w-full flex-col justify-center py-4">
          {renderScreen(
            screen,
            (a) => setAnswer(index, a),
            phase === 'checked' && lastResult ? lastResult.correct : null,
          )}
        </div>

        <LessonControls
          mode={isConcept ? 'concept' : phase}
          hasAnswer={hasAnswer}
          hasExplain={Boolean(screen.explain)}
          onCheck={handleCheck}
          onContinue={handleContinue}
          onExplain={() => setExplainOpen(true)}
        />
      </div>

      <ExplanationDialog
        open={explainOpen}
        onOpenChange={setExplainOpen}
        text={screen.explain ?? ''}
      />
    </div>
  )
}
