import { Zap } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { useProgressStore } from '#/engine/progress/progressStore.ts'

export default function StreakTracker() {
  const streak = useProgressStore((s) => s.streak)

  return (
    <Card className="p-5">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-4xl font-black text-(--color-text)">{streak}</span>
            <Zap className="h-7 w-7 fill-secondary text-secondary" />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex h-6 w-4 items-center justify-center rounded-sm bg-secondary">
              <Zap className="h-3 w-3 text-(--color-text)" />
            </div>
            <div className="flex h-6 w-4 items-center justify-center rounded-sm border border-border" />
          </div>
        </div>
        <p className="mt-2 text-base font-semibold text-muted">hari berturut-turut</p>
      </CardContent>
    </Card>
  )
}




