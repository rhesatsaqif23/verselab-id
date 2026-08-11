import { Zap } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

const DAYS = ['T', 'W', 'Th', 'F', 'S']

export default function StreakTracker() {
  const streak = 1
  const activeDay = 0

  return (
    <Card className="p-5">
      <CardContent className="p-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-4xl font-black text-(--color-text)">{streak}</span>
            <Zap className="h-7 w-7 fill-(--color-secondary) text-(--color-secondary)" />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-4 items-center justify-center rounded-sm bg-(--color-secondary)">
              <Zap className="h-3 w-3 text-(--color-text)" />
            </div>
            <div className="flex h-6 w-4 items-center justify-center rounded-sm border border-(--color-border)" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          {DAYS.map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  i === activeDay
                    ? 'border-(--color-secondary) bg-(--color-secondary)'
                    : 'border-(--color-border) bg-transparent'
                }`}
              >
                <Zap
                  className={`h-6 w-6 ${
                    i === activeDay
                      ? 'fill-(--color-text) text-(--color-text)'
                      : 'fill-(--color-border) text-(--color-border)'
                  }`}
                />
              </div>
              <span
                className={`text-sm font-semibold ${
                  i === activeDay ? 'text-(--color-text)' : 'text-(--color-muted)'
                }`}
              >
                {day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
