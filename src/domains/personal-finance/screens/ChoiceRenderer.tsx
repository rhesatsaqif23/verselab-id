// ChoiceRenderer: multiple-choice cards with correct/wrong feedback icons.
import { useState } from 'react'
import { cn } from '#/libs/utils.ts'
import { Button } from '#/components/ui/button.tsx'
import { Check, X } from 'lucide-react'
import type { Screen } from '#/engine/types.ts'

type ChoiceRendererProps = {
  screen: Extract<Screen, { type: 'choice' }>
  onSelect: (selectedId: string) => void
  checked: boolean | null
}

export default function ChoiceRenderer({ screen, onSelect, checked }: ChoiceRendererProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleClick(id: string) {
    setSelected(id)
    onSelect(id)
  }

  function getOptionStyle(optionId: string): string {
    if (checked === null) {
      return selected === optionId
        ? 'border-primary text-foreground ring-2 ring-primary/20'
        : 'border-border text-foreground hover:border-primary/50 hover:bg-accent/5'
    }
    if (screen.correctId === optionId) {
      return selected === optionId
        ? 'border-success bg-success/10 text-success animate-pulse-glow'
        : 'border-success text-success'
    }
    if (selected === optionId && !checked) {
      return 'border-destructive bg-destructive/10 text-destructive animate-shake'
    }
    return 'border-border text-muted opacity-50'
  }

  function getOptionIcon(optionId: string): React.ReactNode {
    if (checked === null) return null
    if (screen.correctId === optionId) {
      return (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-md bg-success text-white">
          <Check className="h-4 w-4" />
        </div>
      )
    }
    if (selected === optionId && !checked) {
      return (
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-md bg-destructive text-white">
          <X className="h-4 w-4" />
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className="flex flex-col gap-3">
        {screen.options.map((option) => (
          <div key={option.id} className="relative">
            <Button
              variant="outline"
              onClick={() => handleClick(option.id)}
              disabled={checked !== null}
              className={cn(
                'w-full justify-start rounded-xl border-2 px-4 py-4 text-left font-medium bg-card shadow-xs transition-all duration-150 disabled:opacity-100',
                getOptionStyle(option.id),
              )}
            >
              {option.label}
            </Button>
            {getOptionIcon(option.id)}
          </div>
        ))}
      </div>
    </div>
  )
}
