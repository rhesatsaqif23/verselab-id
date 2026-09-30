// UnitMapBottomBar: Floating bottom status bar and CTA for whiteboard canvas matching reference design.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Lesson, Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { PrerequisiteDialog, unmetPrerequisites } from "./PrerequisiteDialog.tsx";

type UnitMapBottomBarProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLesson: Lesson | null;
  status: LessonStatus;
  allLessons: Lesson[];
};

export default function UnitMapBottomBar({
  unit,
  completedLessons,
  selectedLesson,
  status,
  allLessons,
}: UnitMapBottomBarProps) {
  const completedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const totalCount = unit.lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentLesson =
    selectedLesson ?? unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  const [showPrereqDialog, setShowPrereqDialog] = useState(false);

  if (!currentLesson) return null;

  const hasNoScreens = currentLesson.screens.length === 0;
  const hasUnmetPrereqs =
    unmetPrerequisites(currentLesson, allLessons, completedLessons).length > 0;

  function handleStartClick(e: React.MouseEvent) {
    if (hasUnmetPrereqs && status !== "previous") {
      e.preventDefault();
      e.stopPropagation();
      setShowPrereqDialog(true);
    }
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4 md:bottom-5 sm:px-8">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-3 rounded-3xl border-2 border-border bg-card/95 p-3.5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          {/* Left: Unit Progress summary */}
          <div className="flex items-center gap-3.5">
            {/* Circular progress badge */}
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
              <span className="text-sm font-black text-primary">{progressPercent}%</span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-sm sm:text-base font-black text-foreground truncate max-w-50 sm:max-w-80">
                {currentLesson.title}
              </span>
              {currentLesson.description && (
                <span className="text-xs text-muted-foreground truncate max-w-50 sm:max-w-80">
                  {currentLesson.description}
                </span>
              )}
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {currentLesson.screens.length * 10} XP
                </span>
                <span>&bull;</span>
                <span>
                  {completedCount} dari {totalCount} Topik Selesai
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mulai CTA Button */}
          <div className="flex w-full items-center sm:w-auto sm:shrink-0">
            {status === "previous" ? (
              <Button
                asChild={currentLesson.screens.length > 0}
                size="lg"
                disabled={hasNoScreens}
                className="w-full px-6 font-bold text-base shadow-md sm:w-auto sm:min-w-48 sm:px-8"
              >
                {currentLesson.screens.length > 0 ? (
                  <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson.id }}>
                    <RotateCcw className="mr-2 size-5" />
                    Main Lagi
                  </Link>
                ) : (
                  <span className="inline-flex items-center">
                    <RotateCcw className="mr-2 size-5" />
                    Main Lagi
                  </span>
                )}
              </Button>
            ) : (
              <Button
                asChild={!hasNoScreens}
                size="lg"
                disabled={hasNoScreens}
                className="w-full px-6 font-bold text-base shadow-md sm:w-auto sm:min-w-48 sm:px-8"
              >
                {hasNoScreens ? (
                  <span>Belum ada soal</span>
                ) : (
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: currentLesson.id }}
                    onClick={handleStartClick}
                  >
                    <PlayCircle className="mr-2 size-5" />
                    Mulai Belajar
                  </Link>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <PrerequisiteDialog
        open={showPrereqDialog}
        onOpenChange={setShowPrereqDialog}
        lesson={currentLesson}
        allLessons={allLessons}
        completedLessons={completedLessons}
      />
    </>
  );
}
