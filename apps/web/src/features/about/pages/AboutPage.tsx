// MateriPage: displays all units using the same components (UnitHeader and LessonList) as UnitDetail.
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { Unit } from "#/engine/types.ts";
import UnitHeader from "../../unit-detail/components/UnitHeader.tsx";
import LessonList from "../../unit-detail/components/LessonList.tsx";

export default function MateriPage() {
  const routeData = useLoaderData({ strict: false }) as { units: Unit[] } | undefined;
  const units = routeData?.units ?? [];
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const navigate = useNavigate();

  const handleSelectLesson = (unit: Unit, lessonId: string) => {
    void navigate({
      to: "/units/$unitSlug",
      params: { unitSlug: unit.slug },
      search: { lessonId },
    });
  };

  return (
    <main className="page-wrap relative flex min-h-[calc(100vh-140px)] flex-col gap-12 py-8">
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
              selectedLessonId={null}
              onSelectLesson={(lessonId) => handleSelectLesson(unit, lessonId)}
            />
          </div>
        </section>
      ))}
    </main>
  );
}
