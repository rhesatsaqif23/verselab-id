import { useState } from 'react'
import { cn } from '#/lib/utils.ts'
import { Input } from '#/components/ui/input.tsx'
import { Check, X } from 'lucide-react'
import type { Screen } from '#/engine/types.ts'

type NumericRendererProps = {
  screen: Extract<Screen, { type: 'numeric' }>
  onChange: (answer: number | null) => void
  checked: boolean | null
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

export default function NumericRenderer({ screen, onChange, checked }: NumericRendererProps) {
  const [displayValue, setDisplayValue] = useState('')

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value
    const formatted = formatDisplayValue(raw)
    setDisplayValue(formatted)
    onChange(parseNumber(formatted))
  }

  const inputBorder =
    checked === null
      ? 'border-border'
      : checked
        ? 'border-success bg-success/10'
        : 'border-destructive/40 bg-destructive/10'

  const icon =
    checked === null ? null : checked ? (
      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-md bg-success text-white">
        <Check className="h-4 w-4" />
      </div>
    ) : (
      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-md bg-destructive text-white">
        <X className="h-4 w-4" />
      </div>
    )

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className="relative flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="Isi angka"
            value={displayValue}
            onChange={handleInput}
            disabled={checked !== null}
            className={cn(
              'h-12 px-4 text-base font-bold sm:text-lg',
              inputBorder,
            )}
          />
          {icon}
        </div>
        <span className="shrink-0 font-medium text-muted">{screen.unit}</span>
      </div>
    </div>
  )
}
