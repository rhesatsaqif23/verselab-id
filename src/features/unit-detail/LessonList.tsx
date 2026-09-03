import { useState, useEffect, useRef } from "react";
import type { Unit } from "#/engine/types.ts";
import type { LessonStatus } from "./types.ts";
import LessonRow from "./LessonRow.tsx";
import LessonCta from "./LessonCta.tsx";

type LessonListProps = {
  unit: Unit;
  completedLessons: string[];
};

export default function LessonList({ unit, completedLessons }: LessonListProps) {
  // First lesson not yet completed is the current lesson
  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  // Selected lesson state (defaults to current active lesson)
  const [selectedLessonId, setSelectedLessonId] = useState<string>(currentLesson?.id ?? "");
  const [isCtaVisible, setIsCtaVisible] = useState<boolean>(true);

  const lastScrollY = useRef<number>(0);

  // Sync default selection when currentLesson updates
  useEffect(() => {
    if (currentLesson?.id && !selectedLessonId) {
      setSelectedLessonId(currentLesson.id);
    }
  }, [currentLesson?.id, selectedLessonId]);

  // Handle scroll to smoothly hide on scroll down and show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
        setIsCtaVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsCtaVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  const selectedLesson =
    unit.lessons.find((l) => l.id === selectedLessonId) ?? currentLesson;
  const selectedStatus = selectedLesson ? getStatus(selectedLesson.id) : "current";

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsCtaVisible(true);
  };

  // Zigzag offsets (alternating wave like a game map)
  // Even indexes: slightly up/left, Odd indexes: slightly down/right
  const getZigzagOffset = (idx: number) => {
    const pattern = [
      "translate-y-0",
      "translate-y-6 sm:translate-y-8",
      "-translate-y-3 sm:-translate-y-4",
      "translate-y-8 sm:translate-y-10",
      "translate-y-1 sm:translate-y-2",
    ];
    return pattern[idx % pattern.length];
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Horizontal zig-zag track */}
      <div className="relative flex w-full flex-nowrap items-center justify-start sm:justify-center gap-6 sm:gap-10 overflow-x-auto py-12 px-6 scrollbar-none">
        {/* Background connecting path line */}
        <div className="pointer-events-none absolute left-10 right-10 top-1/2 -z-10 h-1 -translate-y-8 bg-border/80 border-t border-dashed border-border" />

        {unit.lessons.map((lesson, idx) => (
          <div key={lesson.id} className="relative shrink-0">
            <LessonRow
              lesson={lesson}
              index={idx}
              status={getStatus(lesson.id)}
              isSelected={selectedLessonId === lesson.id}
              onSelect={() => handleSelectLesson(lesson.id)}
              zigzagOffsetClass={getZigzagOffset(idx)}
            />
          </div>
        ))}
      </div>

      {/* Centered Lesson CTA bottom sheet */}
      {selectedLesson && (
        <div className="fixed bottom-6 z-30 w-full max-w-md px-4 pointer-events-none flex justify-center">
          <div className="w-full pointer-events-auto">
            <LessonCta
              lesson={selectedLesson}
              status={selectedStatus}
              isVisible={isCtaVisible}
            />
          </div>
        </div>
      )}
    </div>
  );
}
