// UnitMapBottomBar: Floating bottom status bar and CTA for whiteboard canvas matching reference design.
import { Link } from "@tanstack/react-router";
import { PlayCircle, RotateCcw, Lock, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Lesson, Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";

type UnitMapBottomBarProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLesson: Lesson | null;
  status: LessonStatus;
};

export default function UnitMapBottomBar({
  unit,
  completedLessons,
  selectedLesson,
  status,
}: UnitMapBottomBarProps) {
  const completedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const totalCount = unit.lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentLesson =
    selectedLesson ??
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ??
    unit.lessons[0];

  if (!currentLesson) return null;

  return (
    <div className="pointer-events-none absolute bottom-5 inset-x-0 z-30 flex justify-center px-4 sm:px-8">
      <div className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-4 rounded-3xl border-2 border-border bg-card/95 p-3.5 sm:px-6 shadow-2xl backdrop-blur-md">
        {/* Left: Unit Progress summary */}
        <div className="flex items-center gap-3.5">
          {/* Circular progress badge */}
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
            <span className="text-xs font-black text-primary">{progressPercent}%</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Progres Belajar
            </span>
            <span className="text-xs sm:text-sm font-black text-foreground">
              {completedCount} dari {totalCount} Topik Selesai
            </span>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-primary">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3" />
                {currentLesson.screens.length * 10} XP
              </span>
              <span>&bull;</span>
              <span className="truncate max-w-[140px] sm:max-w-[220px]">
                {currentLesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Mulai CTA Button */}
        <div className="flex items-center shrink-0">
          {status === "previous" && (
            <Button asChild size="lg" className="rounded-2xl px-6 sm:px-8 font-bold text-base shadow-md">
              <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson.id }}>
                <RotateCcw className="mr-2 size-5" />
                Main Lagi
              </Link>
            </Button>
          )}

          {status === "current" && (
            <Button asChild size="lg" className="rounded-2xl px-6 sm:px-8 font-bold text-base shadow-md">
              <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson.id }}>
                <PlayCircle className="mr-2 size-5" />
                Mulai Belajar
              </Link>
            </Button>
          )}

          {status === "unlocked" && (
            <Button disabled size="lg" variant="secondary" className="rounded-2xl px-6 sm:px-8 font-bold text-base opacity-70">
              <Lock className="mr-2 size-5" />
              Terkunci
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
