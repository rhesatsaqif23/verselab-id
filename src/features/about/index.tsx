// MateriPage: displays all units using the same components (UnitHeader and LessonList) as UnitDetail.
import { useState, useEffect, useRef } from "react";
import { units } from "#/content/index.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { Lesson, Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../unit-detail/types.ts";
import UnitHeader from "../unit-detail/UnitHeader.tsx";
import LessonList from "../unit-detail/LessonList.tsx";
import LessonCta from "../unit-detail/LessonCta.tsx";

export default function MateriPage() {
  const completedLessons = useProgressStore((s) => s.completedLessons);

  // Track selection globally across all units: { unitId, lessonId }
  const [selected, setSelected] = useState<{ unitId: string; lessonId: string } | null>(null);
  const [isCtaVisible, setIsCtaVisible] = useState<boolean>(false);

  const lastScrollY = useRef<number>(0);

  // Hide CTA smoothly on scroll down, show on scroll up if a lesson is selected
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 10 && currentScrollY > 100) {
        setIsCtaVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10 && selected !== null) {
        setIsCtaVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selected]);

  function getStatus(unit: Unit, lessonId: string): LessonStatus {
    const currentLesson =
      unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  // Find selected lesson and its status
  let selectedLesson: Lesson | null = null;
  let selectedStatus: LessonStatus = "current";

  if (selected) {
    const unit = units.find((u) => u.id === selected.unitId);
    if (unit) {
      const foundLesson = unit.lessons.find((l) => l.id === selected.lessonId);
      if (foundLesson) {
        selectedLesson = foundLesson;
        selectedStatus = getStatus(unit, foundLesson.id);
      }
    }
  }

  const handleSelectLesson = (unitId: string, lessonId: string) => {
    setSelected({ unitId, lessonId });
    setIsCtaVisible(true);
  };

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      {units.map((unit) => (
        <section
          key={unit.id}
          className="w-full rounded-3xl border border-border bg-card shadow-xs overflow-hidden"
        >
          {/* Unit Header */}
          <UnitHeader unit={unit} />

          {/* Horizontal zig-zag lesson path inside the same card */}
          <div className="border-t border-border/60">
            <LessonList
              unit={unit}
              completedLessons={completedLessons}
              selectedLessonId={selected?.unitId === unit.id ? selected.lessonId : null}
              onSelectLesson={(lessonId) => handleSelectLesson(unit.id, lessonId)}
            />
          </div>
        </section>
      ))}

      {/* Floating Lesson CTA at the bottom of the page */}
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
