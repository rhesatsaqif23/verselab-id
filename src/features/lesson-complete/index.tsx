// LessonCompletePage: celebratory summary of the finished lesson with next steps.
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { useLessonCompleteStore } from './store/lessonCompleteStore'

import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { decayedMastery } from '#/engine/progress/decay.ts'
import { todayString } from '#/libs/date.ts'

export default function LessonCompletePage() {
  const summary = useLessonCompleteStore((s) => s.summary)
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt)
  const today = todayString()

  if (!summary) {
    return (
      <main className="page-wrap px-4 pb-16 pt-8">
        <Card className="mx-auto max-w-xl p-8">
          <CardContent className="p-0 text-center">
            <p className="text-lg font-semibold text-muted">Belum ada lesson yang selesai</p>
            <div className="mt-6">
              <Button asChild size="lg" className="w-full">
                <Link to="/home">Kembali ke beranda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  const unitId = summary.unitId
  const displayAfter =
    summary.masteryAfter != null
      ? decayedMastery(summary.masteryAfter, updatedAt[unitId], today)
      : null

  return (
    <main className="page-wrap flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8">

        {/* Celebratory star asset */}
        <img
          src="/lesson-complete-star.png"
          alt="Lesson selesai"
          className="h-28 w-28 object-contain"
        />

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-foreground">Lesson selesai!</h1>
        </div>

        {/* Stats */}
        <div className="flex w-full gap-4">
          <Card className="flex-1 border-2 border-border p-6 text-center">
            <CardContent className="p-0">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-foreground">{summary.xpEarned}</span>
                <span className="text-base font-bold text-muted">XP</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">Total</p>
            </CardContent>
          </Card>

          <Card className="flex-1 border-2 border-border p-6 text-center">
            <CardContent className="p-0">
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-5xl font-black text-foreground">{summary.correctCount}</span>
                <span className="text-xl font-bold text-muted">/{summary.totalScreens}</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Mastery */}
        {displayAfter != null && (
          <Card className="w-full border-2 border-border p-4 text-center">
            <CardContent className="p-0">
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-base font-bold text-muted">Mastery {summary.unitName}</p>
              </div>
              <p className="mt-2 text-4xl font-black text-foreground">{displayAfter}%</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/home">Lanjut</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
