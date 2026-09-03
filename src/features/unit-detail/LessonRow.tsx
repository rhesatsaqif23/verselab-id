// LessonRow: single lesson item with disc indicator and title.
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Lesson } from "#/engine/types.ts";

type LessonRowProps = {
  lesson: Lesson;
  index: number;
  status: "completed" | "active" | "not-started";
};

export default function LessonRow({ lesson, index, status }: LessonRowProps) {
  const discBase = "flex shrink-0 items-center justify-center rounded-full font-black transition-all duration-300 select-none";

  const discClass =
    status === "completed"
      ? `${discBase} size-14 bg-success text-white shadow-md`
      : status === "active"
        ? `${discBase} size-16 scale-110 bg-primary text-white shadow-lg ring-4 ring-primary/30`
        : `${discBase} size-14 bg-muted text-muted-foreground`;

  const titleClass =
    status === "completed"
      ? "text-base font-medium text-foreground opacity-60 line-through"
      : status === "active"
        ? "text-base font-bold text-foreground"
        : "text-base text-muted-foreground";

  return (
    <Link
      to="/lesson/$lessonId"
      params={{ lessonId: lesson.id }}
      className="group flex items-center gap-5 px-2 py-4 transition-opacity hover:opacity-80"
    >
      {/* Disc indicator */}
      <div className={discClass}>
        {status === "completed" ? (
          <Check className="size-6 stroke-[3]" />
        ) : (
          <span className="text-lg">{index + 1}</span>
        )}
      </div>

      {/* Lesson title */}
      <span className={titleClass}>{lesson.title}</span>
    </Link>
  );
}
