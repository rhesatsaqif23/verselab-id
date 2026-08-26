import { createFileRoute } from "@tanstack/react-router"
import { LessonList } from "#/features/admin/components/LessonList.tsx"

export const Route = createFileRoute("/admin/$unitId")({
  component: LessonListRoute,
})

function LessonListRoute() {
  const { unitId } = Route.useParams()
  return <LessonList unitId={unitId} />
}