import { Check, Lock } from "lucide-react";
import type { Lesson } from "#/engine/types.ts";
import type { LessonStatus } from "./types.ts";
import { getLessonIcon } from "./iconHelper.ts";

export type { LessonStatus };

type LessonRowProps = {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  isSelected: boolean;
  onSelect: () => void;
  zigzagOffsetClass?: string;
};

export default function LessonRow({
  lesson,
  index,
  status,
  isSelected,
  onSelect,
  zigzagOffsetClass = "",
}: LessonRowProps) {
  const IconComponent = getLessonIcon(lesson.icon);

  // Solid, non-transparent base styles with consistent size (size-28 sm:size-32)
  const discBase =
    "relative flex shrink-0 items-center justify-center size-28 sm:size-32 rounded-3xl transition-all duration-200 select-none cursor-pointer bg-card border-2";

  const discCardStyle = (() => {
    if (status === "previous") {
      return `${discBase} border-border shadow-md ${
        isSelected ? "ring-4 ring-primary/40 border-primary" : ""
      }`;
    }
    if (status === "current") {
      return `${discBase} border-primary shadow-xl ring-4 ring-primary/20 ${
        isSelected ? "ring-6 ring-primary/50" : ""
      }`;
    }
    // unlocked (future uncompleted lessons)
    return `${discBase} border-border shadow-sm opacity-90 ${
      isSelected ? "ring-4 ring-muted-foreground/30 border-muted-foreground" : ""
    }`;
  })();

  const titleClass = (() => {
    if (status === "previous") {
      return "text-xs sm:text-sm font-semibold text-foreground/80 text-center max-w-[130px] line-clamp-2";
    }
    if (status === "current") {
      return "text-xs sm:text-sm font-black text-foreground text-center max-w-[130px] line-clamp-2";
    }
    return "text-xs sm:text-sm font-medium text-muted-foreground text-center max-w-[130px] line-clamp-2";
  })();

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group flex flex-col items-center gap-3 p-1 select-none transition-transform cursor-pointer ${zigzagOffsetClass}`}
    >
      {/* Solid Lesson Card */}
      <div className={discCardStyle}>
        {/* Sequence tag */}
        <div className="absolute top-2.5 left-3 flex items-center">
          <span className="text-[11px] font-bold text-muted-foreground">
            #{index + 1}
          </span>
        </div>

        {status === "previous" && (
          <div className="absolute top-2.5 right-3 flex size-5 items-center justify-center rounded-full bg-success text-white shadow-xs">
            <Check className="size-3.5 stroke-3" />
          </div>
        )}

        {status === "unlocked" && (
          <div className="absolute top-2.5 right-3 flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-3 stroke-[2.5]" />
          </div>
        )}

        {/* Center Lucide Icon */}
        <div className="flex flex-col items-center justify-center">
          <IconComponent
            className={`size-11 sm:size-12 transition-transform group-hover:scale-105 ${
              status === "current"
                ? "text-primary"
                : status === "previous"
                  ? "text-success"
                  : "text-muted-foreground/70"
            }`}
          />
        </div>
      </div>

      {/* Lesson Title */}
      <span className={titleClass}>{lesson.title}</span>
    </div>
  );
}
