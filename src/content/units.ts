import type { Unit } from '#/engine/types.ts'
import { whySaveEarlyLesson } from './lessons/why-save-early.ts'

const dummyLesson = (id: string, title: string) => ({
  id,
  title,
  screens: [
    {
      type: 'concept' as const,
      prompt: 'Konten segera hadir.',
      explain: 'Lesson ini sedang dalam pengembangan.',
    },
  ],
})

export const units = [
  {
    id: 'bunga-berbunga',
    title: 'Bunga berbunga',
    lessons: [whySaveEarlyLesson],
  },
  {
    id: 'nilai-waktu-uang',
    title: 'Nilai waktu uang',
    lessons: [dummyLesson('nilai-waktu-uang-1', 'Uang sekarang vs masa depan')],
  },
  {
    id: 'anggaran-bulanan',
    title: 'Anggaran bulanan',
    lessons: [dummyLesson('anggaran-bulanan-1', 'Membuat anggaran sederhana')],
  },
  {
    id: 'hutang-cicilan',
    title: 'Hutang & cicilan',
    lessons: [dummyLesson('hutang-cicilan-1', 'Memahami bunga pinjaman')],
  },
] satisfies readonly Unit[]
