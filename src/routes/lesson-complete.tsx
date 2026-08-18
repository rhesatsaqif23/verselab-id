// Lesson-complete route: guards and renders the completion page.
import { createFileRoute, redirect } from "@tanstack/react-router";
import LessonCompletePage from "../features/lesson-complete";
import { useLessonCompleteStore } from "#/features/lesson-complete/store/lessonCompleteStore";

export const Route = createFileRoute("/lesson-complete")({
  beforeLoad: () => {
    if (!useLessonCompleteStore.getState().summary) {
      throw redirect({ to: "/" });
    }
  },
  component: LessonCompletePage,
});
