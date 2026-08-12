import type { Unit } from '#/engine/types.ts'
import { whySaveEarlyLesson } from './lessons/why-save-early.ts'

export const units = [
  {
    id: 'bunga-berbunga',
    title: 'Bunga berbunga',
    lessons: [whySaveEarlyLesson],
  },
] satisfies readonly Unit[]
