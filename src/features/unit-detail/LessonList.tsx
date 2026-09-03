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

  // Zigzag via padding-top so the container height adapts to content (transforms are layout-invisible)
  const getZigzagOffset = (idx: number) => {
    const pattern = ["pt-0", "pt-28", "pt-6", "pt-36"];
    return pattern[idx % pattern.length];
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Horizontal zig-zag track with generous edge padding (px-12 sm:px-20 lg:px-28) to prevent edge cropping */}
      <div className="relative flex w-full flex-nowrap items-start justify-start sm:justify-center gap-6 sm:gap-8 md:gap-10 overflow-x-auto py-8 px-6 sm:px-10 lg:px-14 scrollbar-none">
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
