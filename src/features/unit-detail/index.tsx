// UnitDetailPage: horizontal full-width layout with root-level floating LessonCta.
import { useState, useEffect, useRef } from "react";
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { LessonStatus } from "./types.ts";
import UnitHeader from "./UnitHeader.tsx";
import LessonList from "./LessonList.tsx";
import LessonCta from "./LessonCta.tsx";

type Props = { unit: Unit };

export default function UnitDetailPage({ unit }: Props) {
  const completedLessons = useProgressStore((s) => s.completedLessons);

  // First lesson not yet completed is the current lesson
  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  // CTA button only views when user clicks a lesson item (null initially)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [isCtaVisible, setIsCtaVisible] = useState<boolean>(false);

  const lastScrollY = useRef<number>(0);

  // Handle scroll to smoothly hide on scroll down and show on scroll up if a lesson is selected
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
        setIsCtaVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10 && selectedLessonId !== null) {
        setIsCtaVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedLessonId]);

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  const selectedLesson = selectedLessonId
    ? unit.lessons.find((l) => l.id === selectedLessonId)
    : null;
  const selectedStatus = selectedLesson ? getStatus(selectedLesson.id) : "current";

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsCtaVisible(true);
  };

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col px-4 py-8 pb-32 sm:px-6 lg:px-8">
      {/* Unit Header */}
      <div className="mb-8 w-full border-b border-border/60 pb-6">
        <UnitHeader unit={unit} />
      </div>

      {/* Horizontal zig-zag lesson path */}
      <div className="flex w-full flex-1 flex-col items-center justify-center rounded-3xl border border-border bg-card p-2 sm:p-6 shadow-xs overflow-hidden">
        <LessonList
          unit={unit}
          completedLessons={completedLessons}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Floating Lesson CTA at the root of the page (only appears when a lesson is clicked) */}
      {selectedLesson && (
        <div className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 sm:px-8 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <LessonCta
              lesson={selectedLesson}
              status={selectedStatus}
              isVisible={isCtaVisible}
            />
          </div>
        </div>
      )}
    </main>
  );
}
