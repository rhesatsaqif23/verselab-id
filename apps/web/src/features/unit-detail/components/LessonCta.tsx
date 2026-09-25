import { useCallback, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle, RotateCcw } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import type { Lesson } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { getLesson } from "#/libs/content-fns.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { PrerequisiteDialog } from "./PrerequisiteDialog.tsx";

const LESSON_STALE = 5 * 60 * 1000;

type LessonCtaProps = {
  lesson: Lesson;
  status: LessonStatus;
  isVisible: boolean;
  allLessons?: Lesson[];
};

export default function LessonCta({ lesson, status, isVisible, allLessons = [] }: LessonCtaProps) {
  const queryClient = useQueryClient();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const [showPrereqDialog, setShowPrereqDialog] = useState(false);

  const hasNoScreens = lesson.screens.length === 0;
  const hasUnmetPrereqs =
    lesson.prerequisiteIds?.some((id) => !completedLessons.includes(id)) ?? false;

  const prefetchLesson = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["lesson", lesson.id],
      queryFn: () => getLesson({ data: lesson.id }),
      staleTime: LESSON_STALE,
    });
  }, [queryClient, lesson.id]);

  function handleStartClick(e: React.MouseEvent) {
    if (hasUnmetPrereqs && status !== "previous") {
      e.preventDefault();
      e.stopPropagation();
      setShowPrereqDialog(true);
    }
  }

  return (
    <>
      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <Card className="border-2 border-border shadow-2xl bg-card rounded-2xl">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 text-center sm:text-left">
            <div className="flex flex-col max-w-lg text-center sm:text-left">
              <p className="text-base font-bold text-foreground sm:text-lg truncate">
                {lesson.title}
              </p>
              {lesson.description && (
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {lesson.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {status === "previous" ? (
                <Button
                  asChild={lesson.screens.length > 0}
                  size="lg"
                  disabled={hasNoScreens}
                  className="w-full sm:w-auto sm:min-w-48 text-base! font-bold! shadow-md"
                >
                  {lesson.screens.length > 0 ? (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: lesson.id }}
                      onMouseEnter={prefetchLesson}
                    >
                      <RotateCcw className="mr-2 size-5" />
                      Main Lagi
                    </Link>
                  ) : (
                    <span>
                      <RotateCcw className="mr-2 size-5" />
                      Main Lagi
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  asChild={!hasNoScreens && !hasUnmetPrereqs}
                  size="lg"
                  disabled={hasNoScreens}
                  className="w-full sm:w-auto sm:min-w-48 text-base! font-bold! shadow-md"
                >
                  {hasNoScreens ? (
                    <span>Belum ada soal</span>
                  ) : (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: lesson.id }}
                      onMouseEnter={prefetchLesson}
                      onClick={handleStartClick}
                    >
                      <PlayCircle className="mr-2 size-5" />
                      Mulai
                    </Link>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PrerequisiteDialog
        open={showPrereqDialog}
        onOpenChange={setShowPrereqDialog}
        lesson={lesson}
        allLessons={allLessons}
        completedLessons={completedLessons}
      />
    </>
  );
}
