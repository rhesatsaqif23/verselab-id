// LessonList: right-panel scrollable list of all lessons in a unit with bottom sheet transitions.
import { useState, useEffect, useRef } from "react";
import type { Unit } from "#/engine/types.ts";
import LessonRow, { type LessonStatus } from "./LessonRow.tsx";
import LessonCta from "./LessonCta.tsx";

type LessonListProps = {
  unit: Unit;
  completedLessons: string[];
};

export default function LessonList({ unit, completedLessons }: LessonListProps) {
  // First lesson not yet completed is the current lesson
  const currentLesson = unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

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
        // Scrolling down -> hide smoothly
        setIsCtaVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Scrolling up -> show smoothly
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
    // Smoothly ensure bottom sheet appears again when clicked
    setIsCtaVisible(true);
  };

  return (
    <div className="relative flex flex-col pb-10">
      {/* Lesson rows */}
      <div className="flex flex-col gap-2">
        {unit.lessons.map((lesson, idx) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            index={idx}
            status={getStatus(lesson.id)}
            isSelected={selectedLessonId === lesson.id}
            onSelect={() => handleSelectLesson(lesson.id)}
          />
        ))}
      </div>

      {/* Floating bottom sheet CTA */}
      {selectedLesson && (
        <div className="mt-8">
          <LessonCta
            lesson={selectedLesson}
            status={selectedStatus}
            isVisible={isCtaVisible}
          />
        </div>
      )}
    </div>
  );
}
