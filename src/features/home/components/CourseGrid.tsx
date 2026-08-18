// CourseGrid: grid of units showing mastery, unlock state, and play buttons.
import { Lock, BookOpen, PlayCircle } from 'lucide-react'
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {units.map((unit, i) => {
          const value = masteryForDisplay(unit.id, mastery, updatedAt, today)
          // Unit is unlocked if it's the first, or the previous unit has mastery >= 100
          const prevMastery = i === 0 ? 100 : masteryForDisplay(units[i - 1].id, mastery, updatedAt, today)
          const isUnlocked = prevMastery >= 100 || i === 0
          const isActive = unit.id === next.unit.id
          const lessonCount = unit.lessons.reduce((acc, l) => acc + l.screens.length, 0)

          return (
            <Link
              key={unit.id}
              to="/lesson/$lessonId"
              params={{ lessonId: unit.lessons[0].id }}
              className="block"
              disabled={!isUnlocked}
              aria-disabled={!isUnlocked}
              onClick={(e) => { if (!isUnlocked) e.preventDefault() }}
            >
              <Card
                className={[
                  'flex flex-col justify-between border-2 p-2.5 transition-all duration-150',
                  isActive
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : isUnlocked
                      ? 'border-border hover:-translate-y-0.5'
                      : 'border-border opacity-60',
                ].join(' ')}
              >
                {/* Top row: icon + lock */}
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-4.5 w-4.5 text-primary" />
                  </div>
                  {!isUnlocked && (
                    <Lock className="h-4 w-4 text-muted/70" />
                  )}
                </div>

                {/* Title + meta */}
                <div>
                  <p className="text-sm capitalize font-bold leading-tight text-foreground">
                    {unit.title}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    Lesson {i + 1} · {lessonCount} screen
                  </p>
                </div>

                {/* Bottom: progress or locked */}
                <div>
                  {isUnlocked ? (
                    <div className="flex items-center gap-2">
                      {/* Mini progress bar */}
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      {/* Play button */}
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                        <PlayCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted/70">Terkunci</p>
                  )}
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}