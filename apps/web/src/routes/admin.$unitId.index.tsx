import { createFileRoute } from "@tanstack/react-router";
import { LessonList } from "#/features/admin/pages/LessonList.tsx";

export const Route = createFileRoute("/admin/$unitId/")({
  component: LessonListRoute,
});

function LessonListRoute() {
  const { unitId } = Route.useParams();
  return <LessonList unitId={unitId} />;
}
