import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import LessonCompletePage from "../features/lesson-complete";
import { useLessonCompleteStore } from "../features/lesson-complete/lessonCompleteStore";

export const Route = createFileRoute("/lesson-complete")({
  beforeLoad: () => {
    if (!useLessonCompleteStore.getState().summary) {
      throw redirect({ to: "/" });
    }
  },
  component: LessonCompleteRoute,
});

function LessonCompleteRoute() {
  const navigate = useNavigate();
  return <LessonCompletePage onBackHome={() => navigate({ to: "/" })} />;
}
