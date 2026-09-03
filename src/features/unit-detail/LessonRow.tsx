// LessonRow: single lesson item with disc indicator, status and selection handling.
import { Check, Lock } from "lucide-react";
import type { Lesson } from "#/engine/types.ts";

export type LessonStatus = "previous" | "current" | "unlocked";

type LessonRowProps = {
  lesson: Lesson;
  index: number;
  status: LessonStatus;
  isSelected: boolean;
  onSelect: () => void;
};

export default function LessonRow({
  lesson,
  index,
  status,
  isSelected,
  onSelect,
}: LessonRowProps) {
  const discBase =
    "flex shrink-0 items-center justify-center rounded-full font-black transition-all duration-300 select-none cursor-pointer";

  // Visual styles for disc indicator
  const discClass = (() => {
    if (status === "previous") {
      return `${discBase} size-14 bg-success text-white shadow-md hover:opacity-90 ${
        isSelected ? "ring-4 ring-success/40 scale-105" : ""
      }`;
    }
    if (status === "current") {
      return `${discBase} size-16 scale-110 bg-primary text-white shadow-lg ring-4 ring-primary/30 hover:opacity-95 ${
        isSelected ? "ring-6 ring-primary/50" : ""
      }`;
    }
    // unlocked (future uncompleted lesson)
    return `${discBase} size-14 bg-muted text-muted-foreground hover:bg-muted/80 ${
      isSelected ? "ring-4 ring-muted-foreground/30 scale-105" : ""
    }`;
  })();

  const titleClass = (() => {
    if (status === "previous") {
      return "text-base font-medium text-foreground opacity-70";
    }
    if (status === "current") {
      return "text-base font-bold text-foreground";
    }
    return "text-base text-muted-foreground";
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
      className={`group flex w-full items-center gap-5 px-3 py-4 rounded-xl transition-all cursor-pointer ${
        isSelected ? "bg-accent/40" : "hover:bg-accent/20"
      }`}
    >
      {/* Disc indicator */}
      <div className={discClass}>
        {status === "previous" ? (
          <Check className="size-6 stroke-[3]" />
        ) : status === "current" ? (
          <span className="text-xl">{index + 1}</span>
        ) : (
          <Lock className="size-5 text-muted-foreground stroke-[2.5]" />
        )}
      </div>

      {/* Lesson title */}
      <span className={titleClass}>{lesson.title}</span>
    </div>
  );
}
