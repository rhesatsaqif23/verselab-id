import { Button } from '#/components/ui/button.tsx'
import type { Screen } from '#/engine/types.ts'

type ConceptRendererProps = {
  screen: Extract<Screen, { type: 'concept' }>
  onContinue: () => void
}

export default function ConceptRenderer({ screen, onContinue }: ConceptRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium leading-relaxed">{screen.prompt}</p>
      <Button variant="default" size="lg" onClick={onContinue} className="w-full">
        Lanjut
      </Button>
    </div>
  )
}
