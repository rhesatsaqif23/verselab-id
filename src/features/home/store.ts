// Home store: selected unit driving the hero UnitCard, changed by the UnitGrid.
import { create } from 'zustand'
import { units, nextLesson } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/libs/date.ts'

type HomeState = {
  selectedUnitId: string
  setSelectedUnit: (unitId: string) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  selectedUnitId: nextLesson(
    units,
    useProgressStore.getState().mastery,
    useProgressStore.getState().masteryUpdatedAt,
    todayString()
  ).unit.id,
  setSelectedUnit: (unitId) => set({ selectedUnitId: unitId }),
}))
