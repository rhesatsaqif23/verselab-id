import { Flame } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

const DAYS = ['T', 'W', 'Th', 'F', 'S']

export default function StreakTracker() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">0</span>
            <Flame className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Solve <span className="font-semibold text-foreground">3 problems</span> to start a streak
        </p>

        <div className="flex items-center justify-between gap-1">
          {DAYS.map((day) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted">
                <Flame className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
