// Home store: selected unit driving the hero UnitCard, changed by the UnitGrid.
import { create } from "zustand";
import { nextLesson } from "#/engine/path/nextLesson.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { todayString } from "#/libs/date.ts";
import type { Unit } from "#/engine/types.ts";

type HomeState = {
  selectedUnitId: string;
  setSelectedUnit: (unitId: string) => void;
  initSelectedUnit: (units: readonly Unit[]) => void;
};

export const useHomeStore = create<HomeState>((set) => ({
  selectedUnitId: "",
  setSelectedUnit: (unitId) => set({ selectedUnitId: unitId }),
  initSelectedUnit: (units) => {
    if (units.length === 0) return;
    const id = nextLesson(
      units,
      useProgressStore.getState().mastery,
      useProgressStore.getState().masteryUpdatedAt,
      todayString(),
    ).unit.id;
    set({ selectedUnitId: id });
  },
}));
