// UnitDetailPage: horizontal full-width layout matching Brilliant course page style.
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import UnitHeader from "./UnitHeader.tsx";
import LessonList from "./LessonList.tsx";

type Props = { unit: Unit };

export default function UnitDetailPage({ unit }: Props) {
  const completedLessons = useProgressStore((s) => s.completedLessons);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      {/* Unit Header: icon, grade/level badge, title, subtitle */}
      <div className="mb-8 w-full border-b border-border/60 pb-6">
        <UnitHeader unit={unit} />
      </div>

      {/* Horizontal zig-zag lesson path */}
      <div className="flex w-full flex-1 flex-col items-center justify-center rounded-3xl border border-border/70 bg-card/40 p-4 sm:p-8 backdrop-blur-xs">
        <LessonList unit={unit} completedLessons={completedLessons} />
      </div>
    </main>
  );
}
