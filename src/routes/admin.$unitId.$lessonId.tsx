import { createFileRoute } from "@tanstack/react-router"
import { ScreenEditor } from "#/features/admin/components/ScreenEditor.tsx"

export const Route = createFileRoute("/admin/$unitId/$lessonId")({
  component: ScreenEditorRoute,
})

function ScreenEditorRoute() {
  const { lessonId } = Route.useParams()
  return <ScreenEditor lessonId={lessonId} />
}