import type { Unit } from "#/engine/types.ts";
import type { LessonStatus } from "./types.ts";
import LessonRow from "./LessonRow.tsx";

type LessonListProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
};

export default function LessonList({
  unit,
  completedLessons,
  selectedLessonId,
  onSelectLesson,
}: LessonListProps) {
  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  // Zigzag offsets (alternating wave like a game map)
  const getZigzagOffset = (idx: number) => {
    const pattern = [
      "-translate-y-4 sm:-translate-y-6",
      "translate-y-8 sm:translate-y-12",
      "-translate-y-6 sm:-translate-y-8",
      "translate-y-10 sm:translate-y-14",
    ];
    return pattern[idx % pattern.length];
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Horizontal zig-zag track with generous edge padding (px-12 sm:px-20 lg:px-28) to prevent edge cropping */}
      <div className="relative flex w-full flex-nowrap items-center justify-start sm:justify-center gap-14 sm:gap-20 md:gap-28 lg:gap-36 overflow-x-auto py-20 px-12 sm:px-20 lg:px-28 scrollbar-none">
        {/* Background connecting path line */}
        <div className="pointer-events-none absolute left-16 right-16 top-1/2 -z-10 h-1 -translate-y-4 bg-border border-t-2 border-dashed border-border" />

        {unit.lessons.map((lesson, idx) => (
          <div key={lesson.id} className="relative shrink-0">
            <LessonRow
              lesson={lesson}
              index={idx}
              status={getStatus(lesson.id)}
              isSelected={selectedLessonId === lesson.id}
              onSelect={() => onSelectLesson(lesson.id)}
              zigzagOffsetClass={getZigzagOffset(idx)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
