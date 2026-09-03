// LessonMapCard: detailed lesson card for whiteboard canvas matching reference design.
import { Check, Lock } from "lucide-react";
import type { Lesson } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { getLessonIcon } from "../iconHelper.ts";

type LessonMapCardProps = {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  isSelected: boolean;
  onSelect: () => void;
};

export default function LessonMapCard({
  lesson,
  index,
  status,
  isSelected,
  onSelect,
}: LessonMapCardProps) {
  const IconComponent = getLessonIcon(lesson.icon);

  // Status-dependent progress percentage and bar color
  const progressPercent = status === "previous" ? 100 : status === "current" ? 35 : 0;

  const cardBorderClass = isSelected
    ? "border-primary ring-4 ring-primary/20 shadow-xl"
    : status === "current"
      ? "border-primary/70 shadow-lg"
      : status === "previous"
        ? "border-border shadow-md"
        : "border-border/70 shadow-sm";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative flex w-[340px] flex-col rounded-3xl border-2 bg-card p-5 select-none transition-shadow duration-200 cursor-pointer ${cardBorderClass}`}
    >
      {/* Top row: Icon box, Title, Topic count */}
      <div className="flex items-start gap-3.5">
        {/* Rounded icon box */}
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border ${
            status === "current"
              ? "border-primary/30 bg-primary/10 text-primary"
              : status === "previous"
                ? "border-success/30 bg-success/10 text-success"
                : "border-border/60 bg-muted/10 text-muted-foreground"
          }`}
        >
          <IconComponent className="size-7 stroke-[2.2]" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {lesson.title}
            </h3>
            {status === "previous" && (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <Check className="size-3.5 stroke-3" />
              </span>
            )}
            {status === "unlocked" && (
              <Lock className="size-4 shrink-0 text-muted-foreground/60 stroke-[2.2]" />
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground pt-1">
            Topik #{index + 1} &bull; {lesson.screens.length} soal
          </span>
        </div>
      </div>

      {/* Middle row: Lesson description snippet */}
      <div className="mt-3.5 min-h-9">
        <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          Pahami konsep dan latihan interaktif untuk menguasai topik ini.
        </p>
      </div>

      {/* Bottom row: Progress bar + label */}
      <div className="mt-4 flex flex-col gap-1.5 pt-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="text-muted-foreground">Progress</span>
          <span
            className={
              status === "previous"
                ? "text-success"
                : status === "current"
                  ? "text-primary"
                  : "text-muted-foreground"
            }
          >
            {progressPercent}%
          </span>
        </div>

        {/* Progress track */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              status === "previous"
                ? "bg-success"
                : status === "current"
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
