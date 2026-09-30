import type { Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { useLessonTrackScroll } from "../hooks/useLessonTrackScroll.ts";
import LessonRow from "./LessonRow.tsx";
import LessonTrackScrollbar from "./LessonTrackScrollbar.tsx";

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

  const {
    trackRef,
    barRef,
    isDragging,
    canScroll,
    progress,
    thumbWidthPct,
    thumbLeftPct,
    handleTrackPointerDown,
    handleTrackPointerMove,
    handleTrackPointerUp,
    handleTrackClickCapture,
    handleBarClick,
    handleBarKeyDown,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
  } = useLessonTrackScroll(unit.lessons.length);

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Outer inset keeps the scrollbar clear of the card's rounded corners */}
      <div className="w-full px-4 pb-4 md:px-8">
        {/* Horizontal zig-zag track with generous edge padding (px-12 sm:px-20 lg:px-28) to prevent edge cropping */}
        <div
          ref={trackRef}
          data-testid="lesson-track"
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerUp}
          onClickCapture={handleTrackClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className={`relative flex w-full flex-nowrap items-start justify-start sm:justify-center gap-6 sm:gap-8 md:gap-10 overflow-x-auto py-8 px-6 md:px-8 lesson-track-scroll touch-pan-x touch-pan-y select-none ${
            isDragging ? "cursor-grabbing **:cursor-grabbing!" : "cursor-grab"
          }`}
        >
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

        {canScroll && (
          <LessonTrackScrollbar
            barRef={barRef}
            progress={progress}
            thumbWidthPct={thumbWidthPct}
            thumbLeftPct={thumbLeftPct}
            onBarClick={handleBarClick}
            onBarKeyDown={handleBarKeyDown}
            onThumbPointerDown={handleThumbPointerDown}
            onThumbPointerMove={handleThumbPointerMove}
            onThumbPointerUp={handleThumbPointerUp}
          />
        )}
      </div>
    </div>
  );
}
