// UnitMapBottomBar: Floating bottom status bar and CTA for whiteboard canvas matching reference design.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Lesson, Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { PrerequisiteDialog } from "./PrerequisiteDialog.tsx";

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
    currentLesson.prerequisiteIds?.some((id) => !completedLessons.includes(id)) ?? false;

  function handleStartClick(e: React.MouseEvent) {
    if (hasUnmetPrereqs && status !== "previous") {
      e.preventDefault();
      e.stopPropagation();
      setShowPrereqDialog(true);
    }
  }

  return (
    <>
      <div className="pointer-events-none absolute bottom-5 inset-x-0 z-30 flex justify-center px-4 sm:px-8">
        <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-3xl border-2 border-border bg-card/95 p-3.5 sm:px-6 shadow-2xl backdrop-blur-md">
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
              <div className="mt-0.5 flex items-center gap-2 text-sm font-semibold text-primary">
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
          <div className="flex items-center shrink-0">
            {status === "previous" ? (
              <Button
                asChild={currentLesson.screens.length > 0}
                size="lg"
                disabled={hasNoScreens}
                className="rounded-2xl px-6 sm:px-8 font-bold text-base"
              >
                {currentLesson.screens.length > 0 ? (
                  <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson.id }}>
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
                className="rounded-2xl px-6 sm:px-8 font-bold text-base"
              >
                {hasNoScreens ? (
                  <span>Belum ada soal</span>
                ) : (
                  <Link
                    to="/lesson/$lessonId"
                    params={{ lessonId: currentLesson.id }}
                    onClick={handleStartClick}
                  >
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
