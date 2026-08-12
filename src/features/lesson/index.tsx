import { useNavigate } from '@tanstack/react-router'
import LessonPlayer, { type AnswerResult } from '#/engine/player/LessonPlayer.tsx'
import { useLessonStore } from '#/engine/player/lessonStore.ts'
import {
  XP_PER_LESSON,
  XP_PER_SCREEN,
  useProgressStore,
} from '#/engine/progress/progressStore.ts'
import { useLessonCompleteStore } from '#/features/lesson-complete/lessonCompleteStore.ts'
import { findLesson } from '#/content/index.ts'
import { checkAnswer } from './checkAnswer.ts'
import { renderScreen } from './renderScreen.tsx'

type LessonPageProps = {
  lessonId: string
}

export default function LessonPage({ lessonId }: LessonPageProps) {
  const navigate = useNavigate()

  const found = findLesson(lessonId)
  if (!found) {
    navigate({ to: '/' })
    return null
  }

  const { unit, lesson } = found

  function handleExit() {
    useLessonStore.getState().clear()
    navigate({ to: '/' })
  }

  function handleComplete(results: readonly AnswerResult[]) {
    const correctCount = results.filter((r) => r.correct).length
    const wrongScreens = results
      .filter((r) => !r.correct)
      .map((r) => ({ prompt: r.screen.prompt, explain: r.screen.explain }))

    const masteryBefore = useProgressStore.getState().mastery[unit.id] ?? null
    for (const result of results) {
      useProgressStore.getState().awardScreenResult(unit.id, result.correct)
    }
    useProgressStore.getState().awardLessonCompletion(unit.id)
    const masteryAfter = useProgressStore.getState().mastery[unit.id] ?? null

    const xpEarned =
      correctCount * XP_PER_SCREEN + XP_PER_LESSON

    useLessonCompleteStore.getState().setSummary({
      unitId: unit.id,
      unitName: unit.title,
      totalScreens: results.length,
      correctCount,
      wrongScreens,
      xpEarned,
      masteryBefore,
      masteryAfter,
    })
    navigate({ to: '/lesson-complete' })
  }

  return (
    <LessonPlayer
      screens={lesson.screens}
      renderScreen={renderScreen}
      checkAnswer={checkAnswer}
      onExit={handleExit}
      onComplete={handleComplete}
    />
  )
}
