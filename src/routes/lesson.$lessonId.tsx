import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lesson/$lessonId')({
  component: LessonPlaceholder,
})

function LessonPlaceholder() {
  return null
}
