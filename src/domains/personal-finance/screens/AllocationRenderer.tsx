import { useState } from 'react'
import { cn } from '#/lib/utils.ts'
import { Slider } from '#/components/ui/slider.tsx'
import { Check, X } from 'lucide-react'
import BarChart from '../components/BarChart'
import type { Screen } from '#/engine/types.ts'

type AllocationRendererProps = {
  screen: Extract<Screen, { type: 'allocation' }>
  onChange: (allocation: Record<string, number>) => void
  checked: boolean | null
}

function initialAllocation(categories: readonly string[]): Record<string, number> {
  const result: Record<string, number> = {}
  const base = Math.floor(100 / categories.length)
  let remaining = 100
  categories.forEach((cat, i) => {
    if (i === categories.length - 1) {
      result[cat] = remaining
    } else {
      result[cat] = base
      remaining -= base
    }
  })
  return result
}

function distribute(
  categories: readonly string[],
  current: Record<string, number>,
  moved: string,
  value: number
): Record<string, number> {
  const next = { ...current }
  const peers = categories.filter((c) => c !== moved)

  let peerTotal = peers.reduce((acc, c) => acc + next[c], 0)
  let adjustment = 100 - value - peerTotal

  for (const peer of peers) {
    if (adjustment === 0) break
    const weight = peerTotal === 0 ? 1 / peers.length : next[peer] / peerTotal
    const share = adjustment * weight
    const clamped = Math.max(0, Math.min(100, next[peer] + share))
    const applied = clamped - next[peer]
    next[peer] = clamped
    adjustment -= applied
  }

  next[moved] = 100 - peers.reduce((acc, c) => acc + next[c], 0)
  return next
}

export default function AllocationRenderer({ screen, onChange, checked }: AllocationRendererProps) {
  const [allocation, setAllocation] = useState(() =>
    initialAllocation(screen.categories)
  )

  function handleChange(category: string, value: number) {
    const next = distribute(screen.categories, allocation, category, value)
    setAllocation(next)
    onChange(next)
  }

  const chartData = screen.categories.map((cat) => ({
    label: cat,
    value: Math.round(allocation[cat] ?? 0),
  }))

  const wrapperClass =
    checked === null
      ? ''
      : checked
        ? 'rounded-2xl border-2 border-success bg-success/10 p-4'
        : 'rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4'

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
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium">{screen.prompt}</p>
      <div className={cn('relative', wrapperClass)}>
        <BarChart data={chartData} />
        <div className="flex flex-col gap-5 mt-6">
          {screen.categories.map((category) => (
            <div key={category} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm text-muted">{Math.round(allocation[category] ?? 0)}%</span>
              </div>
              <Slider
                value={[Math.round(allocation[category] ?? 0)]}
                min={0}
                max={100}
                step={1}
                onValueChange={(values) => handleChange(category, values[0])}
                disabled={checked !== null}
              />
            </div>
          ))}
        </div>
        {icon}
      </div>
    </div>
  )
}
