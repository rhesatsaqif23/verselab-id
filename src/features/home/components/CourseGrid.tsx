import { Link } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { Progress } from '#/components/ui/progress'
import { units } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'

export default function CourseGrid() {
  const mastery = useProgressStore((s) => s.mastery)

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3">
        {units.map((unit) => {
          const value = mastery[unit.id] ?? 0
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
  )
}