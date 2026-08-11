import { create } from 'zustand'

type HomeState = {
  streak: number
  selected: string | null
  setStreak: (n: number) => void
  select: (id: string | null) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  streak: 0,
  selected: null,
  setStreak: (n) => set(() => ({ streak: n })),
  select: (id) => set(() => ({ selected: id })),
}))
