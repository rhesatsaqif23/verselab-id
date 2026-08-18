// DailyGoalCard: shows today's daily goal progress and links to settings.
import { Target, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent } from '#/components/ui/card'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/libs/date.ts'

export default function DailyGoalCard() {
  const dailyGoalMinutes = useProgressStore((s) => s.dailyGoalMinutes)
  const lastActiveDate = useProgressStore((s) => s.lastActiveDate)

  const reached = lastActiveDate === todayString()
  // For now, minutes done today = goal if reached, else 0
  const minutesDone = reached ? dailyGoalMinutes : 0
  const progress = Math.min(minutesDone / dailyGoalMinutes, 1)

  return (
    <Card className="border-2 border-border p-5">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Target icon badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Target className="h-7 w-7 text-primary" />
          </div>

          {/* Goal info */}
          <div>
            <p className="text-base font-bold">Goal harian</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-foreground leading-none">{minutesDone}</span>
              <span className="text-sm font-medium text-muted">/ {dailyGoalMinutes} menit</span>
            </div>

          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <p className={reached ? 'mt-3 text-sm font-semibold' : 'mt-2 text-sm font-medium text-muted'}>
          {reached ? 'Tercapai hari ini 🎉' : 'Belum tercapai'}
        </p>

        {/* Divider */}
        <div className="mt-3 border-t border-border" />

        {/* Link to profile */}
        <Link
          to="/profile"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          Atur goal harian
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
