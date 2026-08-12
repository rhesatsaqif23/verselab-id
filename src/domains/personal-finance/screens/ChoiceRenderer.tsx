import { useState } from 'react'
import { cn } from '#/lib/utils.ts'
import { Button } from '#/components/ui/button.tsx'
import type { Screen } from '#/engine/types.ts'

type ChoiceRendererProps = {
  screen: Extract<Screen, { type: 'choice' }>
  onSelect: (selectedId: string) => void
}

export default function ChoiceRenderer({ screen, onSelect }: ChoiceRendererProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleClick(id: string) {
    setSelected(id)
    onSelect(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className="flex flex-col gap-3">
        {screen.options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            onClick={() => handleClick(option.id)}
            className={cn(
              'w-full justify-start rounded-2xl border-2 px-4 py-3 text-left font-normal',
              selected === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
