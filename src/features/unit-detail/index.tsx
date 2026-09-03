// UnitDetailPage: two-column layout — sticky left info card + scrollable right lesson list.
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import UnitInfoCard from "./UnitInfoCard.tsx";
import LessonList from "./LessonList.tsx";

type Props = { unit: Unit };

export default function UnitDetailPage({ unit }: Props) {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Two-column layout on md+, stacked on mobile */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        {/* Left: sticky unit info card */}
        <div className="w-full shrink-0 md:sticky md:top-24 md:w-72 lg:w-80">
          <UnitInfoCard unit={unit} />
        </div>

        {/* Right: scrollable lesson list */}
        <div className="min-w-0 flex-1">
          <LessonList unit={unit} completedLessons={completedLessons} />
        </div>
      </div>
    </main>
  );
}
