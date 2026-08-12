import { Target } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/content/index.ts'

export default function DailyGoalCard() {
  const dailyGoalMinutes = useProgressStore((s) => s.dailyGoalMinutes)
  const lastActiveDate = useProgressStore((s) => s.lastActiveDate)

  const reached = lastActiveDate === todayString()

  return (
    <Card className="p-5">
      <CardContent className="p-0">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
            <Target className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Goal harian</p>
            <p className="text-xs font-semibold text-muted">{dailyGoalMinutes} menit</p>
          </div>
        </div>
        <p
          className={
            reached
              ? 'text-sm font-bold text-success'
              : 'text-sm font-bold text-muted'
          }
        >
          {reached ? 'Tercapai hari ini' : 'Belum tercapai'}
        </p>
      </CardContent>
    </Card>
  )
}
