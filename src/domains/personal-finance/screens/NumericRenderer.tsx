import { useState } from 'react'
import { Input } from '#/components/ui/input.tsx'
import type { Screen } from '#/engine/types.ts'

type NumericRendererProps = {
  screen: Extract<Screen, { type: 'numeric' }>
  onChange: (answer: number | null) => void
}

function formatDisplayValue(raw: string): string {
  const cleaned = raw.replace(/[^0-9.,-]/g, '')
  if (!cleaned) return ''

  const isNegative = cleaned.startsWith('-')
  const body = isNegative ? cleaned.slice(1) : cleaned

  const parts = body.split(',')
  const integerDigits = parts[0].replace(/\./g, '')

  if (integerDigits === '' && parts.length === 1) {
    return isNegative ? '-' : ''
  }

  const formattedInteger = integerDigits
    ? integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    : '0'

  let result = (isNegative ? '-' : '') + formattedInteger

  if (parts.length > 1) {
    result += ',' + parts.slice(1).join('')
  }

  return result
}

function parseNumber(raw: string): number | null {
  const normalized = raw.replace(/\./g, '').replace(',', '.')
  if (normalized === '' || normalized === '-') return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

export default function NumericRenderer({ screen, onChange }: NumericRendererProps) {
  const [displayValue, setDisplayValue] = useState('')

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value
    const formatted = formatDisplayValue(raw)
    setDisplayValue(formatted)
    onChange(parseNumber(formatted))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className="flex items-center gap-3">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Isi angka"
          value={displayValue}
          onChange={handleInput}
          className="h-12 px-4 text-base font-bold sm:text-lg"
        />
        <span className="shrink-0 font-medium text-muted">{screen.unit}</span>
      </div>
    </div>
  )
}
