// Engine core types: the Screen union and Lesson/Unit containers used everywhere.
export type AllocationRule = {
    category: string
    min?: number
    max?: number
}

export type Screen =
    | { type: 'concept'; prompt: string; explain: string }
    | {
        type: 'choice'
        prompt: string
        options: { id: string; label: string }[]
        correctId: string
        explain: string
    }
    | {
        type: 'numeric'
        prompt: string
        unit: string
        acceptRange: [number, number]
        explain: string
    }
    | {
        type: 'allocation'
        prompt: string
        categories: string[]
        rule: AllocationRule
        explain: string
    }

export type Lesson = {
    id: string
    title: string
    screens: readonly Screen[]
}

export type Unit = {
    id: string
    title: string
    lessons: readonly Lesson[]
}
