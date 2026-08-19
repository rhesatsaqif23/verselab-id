// CourseGrid: grid of units showing icon and title.
import { BookOpen } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Card } from '#/components/ui/card'
import { units, nextLesson } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { todayString } from '#/libs/date.ts'
import { masteryForDisplay } from '#/engine/progress/masteryRead.ts'

export default function CourseGrid() {
  const mastery = useProgressStore((s) => s.mastery)
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt)
  const today = todayString()

  const next = nextLesson(units, mastery, updatedAt, today)

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 items-center gap-3 lg:grid-cols-4">
        {units.map((unit, i) => {
          const prevMastery = i === 0 ? 100 : masteryForDisplay(units[i - 1].id, mastery, updatedAt, today)
          const isUnlocked = prevMastery >= 100 || i === 0
          const isActive = unit.id === next.unit.id

          return (
            <Link
              key={unit.id}
              to="/lesson/$lessonId"
              params={{ lessonId: unit.lessons[0].id }}
              className="block h-full"
              disabled={!isUnlocked}
              aria-disabled={!isUnlocked}
              onClick={(e) => { if (!isUnlocked) e.preventDefault() }}
            >
              <Card
                className={[
                  'flex h-full flex-col items-center justify-center gap-3 border-2 p-5 transition-all duration-150',
                  isActive
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : 'border-border hover:-translate-y-0.5',
                ].join(' ')}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <p className="text-center text-sm font-bold leading-tight text-foreground">
                  {unit.title}
                </p>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}