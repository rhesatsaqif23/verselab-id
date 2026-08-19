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
    <main className="flex min-h-screen w-full flex-col px-8 py-8">
      {/* Content — vertically centered like lesson screen renderer */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <div className="my-auto flex flex-col items-center gap-8 px-6 py-4 text-center">

          {/* Celebratory star asset */}
          <img
            src="/lesson-complete-star.png"
            alt="Lesson selesai"
            className="h-28 w-28 object-contain"
          />

          {/* Title */}
          <h1 className="text-4xl font-black text-foreground">Lesson selesai!</h1>

          {/* Stats */}
          <div className="flex w-full max-w-md gap-4">
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
            <Card className="w-full max-w-sm border-2 border-border p-4 text-center">
              <CardContent className="p-0">
                <p className="text-base font-bold text-muted">Mastery {summary.unitName}</p>
                <p className="mt-2 text-4xl font-black text-foreground">{displayAfter}%</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Button — same position as LessonControls */}
        <div className="mx-auto w-full max-w-md flex min-h-20 flex-col gap-3 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/home">Lanjut</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
