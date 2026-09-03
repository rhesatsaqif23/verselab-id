// LessonList: right-panel scrollable list of all lessons in a unit.
import type { Unit } from "#/engine/types.ts";
import LessonRow from "./LessonRow.tsx";
import LessonCta from "./LessonCta.tsx";

type LessonListProps = {
  unit: Unit;
  completedLessons: string[];
};

export default function LessonList({ unit, completedLessons }: LessonListProps) {
  // First lesson not yet completed is "active"
  const activeLesson = unit.lessons.find((l) => !completedLessons.includes(l.id));
  const hasStarted = completedLessons.length > 0;
  const allComplete = !activeLesson;

  function getStatus(lessonId: string): "completed" | "active" | "not-started" {
    if (completedLessons.includes(lessonId)) return "completed";
    if (activeLesson?.id === lessonId) return "active";
    return "not-started";
  }

  return (
    <div className="flex flex-col">
      {/* Dividers between rows but not around the container */}
      <div className="divide-y divide-border">
        {unit.lessons.map((lesson, idx) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={idx}
            status={getStatus(lesson.id)}
          />
        ))}
      </div>

      {/* Sticky CTA — only shown when there's still an active lesson */}
      {!allComplete && activeLesson && (
        <LessonCta activeLesson={activeLesson} hasStarted={hasStarted} />
      )}
    </div>
  );
}
