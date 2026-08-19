// Content units: ordered list of units and their lessons for the learning path.
import type { Unit } from '#/engine/types.ts'
import { whySaveEarlyLesson } from './lessons/why-save-early.ts'
import { nilaiWaktuUangLesson } from './lessons/nilai-waktu-uang.ts'
import { anggaranBulananLesson } from './lessons/anggaran-bulanan.ts'
import { hutangCicilanLesson } from './lessons/hutang-cicilan.ts'

export const units = [
  {
    id: 'bunga-berbunga',
    title: 'Bunga berbunga',
    lessons: [whySaveEarlyLesson],
  },
  {
    id: 'nilai-waktu-uang',
    title: 'Nilai waktu uang',
    lessons: [nilaiWaktuUangLesson],
  },
  {
    id: 'anggaran-bulanan',
    title: 'Anggaran bulanan',
    lessons: [anggaranBulananLesson],
  },
  {
    id: 'hutang-cicilan',
    title: 'Hutang & cicilan',
    lessons: [hutangCicilanLesson],
  },
] satisfies readonly Unit[]
