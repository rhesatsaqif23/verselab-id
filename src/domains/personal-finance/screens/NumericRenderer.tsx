import { Input } from '#/components/ui/input.tsx'
import type { Screen } from '#/engine/types.ts'

type NumericRendererProps = {
  screen: Extract<Screen, { type: 'numeric' }>
  onChange: (answer: number | null) => void
}

function parseNumber(raw: string): number | null {
  const normalized = raw.replace(/\./g, '').replace(',', '.')
  if (normalized === '') return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export default function NumericRenderer({ screen, onChange }: NumericRendererProps) {
  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value
    const digitsOnly = raw.replace(/[^0-9.,]/g, '')
    event.target.value = digitsOnly
    onChange(parseNumber(digitsOnly))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className="flex items-center gap-3">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Isi angka"
          onChange={handleInput}
          className="h-12 text-base"
        />
        <span className="shrink-0 text-muted">{screen.unit}</span>
      </div>
    </div>
  )
}
