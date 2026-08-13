import { Link } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { Progress } from '#/components/ui/progress'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { units, todayString } from '#/content/index.ts'
import { masteryForDisplay } from '#/engine/progress/masteryRead.ts'

export default function ProfilePage() {
  const xp = useProgressStore((s) => s.xp)
  const streak = useProgressStore((s) => s.streak)
  const streakFreeze = useProgressStore((s) => s.streakFreeze)
  const mastery = useProgressStore((s) => s.mastery)
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt)
  const today = todayString()

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex gap-4">
          <Card className="flex-1 p-5 text-center">
            <p className="text-3xl font-black text-(--color-text)">{xp}</p>
            <p className="text-sm font-semibold text-muted">Total XP</p>
          </Card>
          <Card className="flex-1 p-5 text-center">
            <p className="text-3xl font-black text-(--color-text)">
              {streak}
              {streakFreeze > 0 && (
                <span className="ml-1 text-lg font-bold text-muted">
                  ({streakFreeze})
                </span>
              )}
            </p>
            <p className="text-sm font-semibold text-muted">
              Streak{streakFreeze > 0 ? ' + Freeze' : ''}
            </p>
          </Card>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">Mastery per unit</h2>
          <div className="flex flex-col gap-3">
            {units.map((unit) => {
              const value = masteryForDisplay(unit.id, mastery, updatedAt, today)
              return (
                <Link
                  key={unit.id}
                  to="/lesson/$lessonId"
                  params={{ lessonId: unit.lessons[0].id }}
                  className="block"
                >
                  <Card className="border-2 bg-card p-5 transition hover:-translate-y-0.5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-lg font-bold text-(--color-text)">{unit.title}</p>
                      <span className="shrink-0 text-base font-bold text-muted">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
