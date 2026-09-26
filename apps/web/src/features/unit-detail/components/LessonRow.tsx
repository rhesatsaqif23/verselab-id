import { Check } from "lucide-react";
import type { Lesson } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { LessonVisual } from "./LessonVisual.tsx";

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
  const iconClassName = `size-11 sm:size-12 transition-transform group-hover:scale-105 ${
    status === "current"
      ? "text-primary"
      : status === "previous"
        ? "text-success"
        : "text-muted-foreground/70"
  }`;

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

  const titleClass = `text-sm sm:text-base text-center max-w-[180px] line-clamp-2 ${
    status === "previous" || isSelected
      ? "font-semibold text-foreground"
      : "font-medium text-muted-foreground"
  }`;

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
          <span className="text-base font-bold text-muted-foreground">#{index + 1}</span>
        </div>

        {status === "previous" && (
          <div className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-success text-white shadow-xs">
            <Check className="size-3.5 stroke-3" />
          </div>
        )}

        {/* Center visual: uploaded image, or Lucide icon fallback */}
        <div className="flex flex-col items-center justify-center">
          <LessonVisual
            lesson={lesson}
            iconClassName={iconClassName}
            imageClassName="size-16 sm:size-20 rounded-2xl object-cover transition-transform group-hover:scale-105"
          />
        </div>
      </div>

      {/* Lesson Title */}
      <span className={titleClass}>{lesson.title}</span>
    </div>
  );
}
