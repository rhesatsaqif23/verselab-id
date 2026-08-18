import { createFileRoute, redirect } from '@tanstack/react-router'
import LessonPage from '../features/lesson'
import { findLesson } from '../content'
import { useLessonStore } from '../engine/player/lessonStore'

export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: ({ params }) => {
    const found = findLesson(params.lessonId)
    if (!found) {
      throw redirect({ to: '/home' })
    }
    useLessonStore.getState().startLesson(found.lesson.screens.length)
  },
  component: LessonRoute,
})

function LessonRoute() {
  const { lessonId } = Route.useParams()
  return <LessonPage lessonId={lessonId} />
}
