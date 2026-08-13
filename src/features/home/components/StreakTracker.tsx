import { Flame, Check } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { cn } from '#/lib/utils.ts'


function getWeekDates(today: Date): Date[] {
  // Week starts on Monday (ISO)
  const day = today.getDay() // 0 = Sun, 1 = Mon, ...
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function StreakTracker() {
  const streak = useProgressStore((s) => s.streak)
  const activeDays = useProgressStore((s) => s.activeDays)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateString(today)
  const weekDates = getWeekDates(today)
  const activeDaySet = new Set(activeDays)

  // Day labels in Indonesian week order: Mon–Sun
  const dayLabels = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

  return (
    <Card className="border-2 border-border p-5">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Fire icon badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
            <Flame className="h-7 w-7 fill-orange-500 text-orange-500" />
          </div>

          {/* Streak info */}
          <div>
            <p className="text-sm font-semibold text-muted">Streak harian</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-foreground leading-none">{streak}</span>
              <span className="text-sm font-medium text-muted">hari berturut-turut</span>
            </div>
          </div>
        </div>

        {/* Weekly day checklist */}
        <div className="mt-5 grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const dateStr = toDateString(date)
            const isToday = dateStr === todayStr
            const isDone = activeDaySet.has(dateStr)

            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5">
                {/* Day label */}
                <span
                  className={cn(
                    'text-xs font-bold',
                    isToday ? 'text-primary' : 'text-muted',
                  )}
                >
                  {dayLabels[i]}
                </span>

                {/* Day circle */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    isDone
                      ? 'border-orange-400 bg-orange-400'
                      : isToday
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-transparent',
                  )}
                >
                  {isDone && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer message */}
        <p className="mt-4 text-sm font-medium text-muted">
          Belajar setiap hari untuk menjaga streak!
        </p>
      </CardContent>
    </Card>
  )
}
