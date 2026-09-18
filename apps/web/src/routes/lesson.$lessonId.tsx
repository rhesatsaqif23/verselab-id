// Lesson route: validates the lesson id and renders the lesson page.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getLesson } from "#/libs/content-fns.ts";
import { LessonPage } from "../features/lesson";
import { useLessonStore } from "../engine/player/lessonStore";

export const Route = createFileRoute("/lesson/$lessonId")({
  loader: async ({ params }) => {
    const lesson = await getLesson({ data: params.lessonId });
    if (!lesson) {
      throw redirect({ to: "/home" });
    }
    useLessonStore.getState().startLesson(lesson.screens.length);
    return { lesson };
  },
  component: LessonRoute,
});

function LessonRoute() {
  const { lessonId } = Route.useParams();
  const { lesson } = Route.useLoaderData();
  return <LessonPage lessonId={lessonId} lesson={lesson} />;
}
