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

  // Disc outer styles
  const discBase =
    "relative flex shrink-0 items-center justify-center rounded-3xl transition-all duration-300 select-none cursor-pointer";

  const discCardStyle = (() => {
    if (status === "previous") {
      return `${discBase} size-24 sm:size-28 border-2 border-border bg-card shadow-sm ${
        isSelected ? "ring-4 ring-primary/40 border-primary" : ""
      }`;
    }
    if (status === "current") {
      return `${discBase} size-28 sm:size-32 border-2 border-primary bg-card shadow-xl ring-4 ring-primary/20 ${
        isSelected ? "ring-6 ring-primary/50" : ""
      }`;
    }
    // unlocked (future / locked)
    return `${discBase} size-24 sm:size-28 border-2 border-border/80 bg-card/60 opacity-85 ${
      isSelected ? "ring-4 ring-muted-foreground/30 border-muted-foreground" : ""
    }`;
  })();

  const titleClass = (() => {
    if (status === "previous") {
      return "text-sm sm:text-base font-semibold text-foreground/80 text-center max-w-[140px]";
    }
    if (status === "current") {
      return "text-sm sm:text-base font-black text-foreground text-center max-w-[150px]";
    }
    return "text-sm sm:text-base font-medium text-muted-foreground text-center max-w-[140px]";
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
      className={`group flex flex-col items-center gap-3 p-2 transition-transform cursor-pointer ${zigzagOffsetClass}`}
    >
      {/* Lesson Card / Box */}
      <div className={discCardStyle}>
        {/* Status indicator badge (top-right or top-left) */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            #{index + 1}
          </span>
        </div>

        {status === "previous" && (
          <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-success text-white shadow-xs">
            <Check className="size-3.5 stroke-[3]" />
          </div>
        )}

        {status === "unlocked" && (
          <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-3 stroke-[2.5]" />
          </div>
        )}

        {/* Center Lucide Icon */}
        <div className="flex flex-col items-center justify-center">
          <IconComponent
            className={`size-10 sm:size-12 transition-transform group-hover:scale-110 ${
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
