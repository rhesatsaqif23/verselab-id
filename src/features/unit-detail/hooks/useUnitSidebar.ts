// useUnitSidebar: encapsulates search/filter state for the UnitSidebar component.
import { useState } from "react";
import type { Unit } from "#/engine/types.ts";

export function useUnitSidebar(unit: Unit, completedLessons: string[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const completedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const totalCount = unit.lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredLessons = unit.lessons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return {
    searchQuery,
    setSearchQuery,
    completedCount,
    totalCount,
    progressPercent,
    filteredLessons,
  };
}
