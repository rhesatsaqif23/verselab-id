import { Star, Trophy } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { useLessonCompleteStore } from './lessonCompleteStore'
import { nextLesson, units, todayString } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { decayedMastery } from '#/engine/progress/decay.ts'

export default function LessonCompletePage() {
  const summary = useLessonCompleteStore((s) => s.summary)
  const mastery = useProgressStore((s) => s.mastery)
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt)
  const today = todayString()

  const next = nextLesson(units, mastery, updatedAt, today)

  if (!summary) {
    return (
      <main className="page-wrap px-4 pb-16 pt-8">
        <Card className="mx-auto max-w-xl p-8">
          <CardContent className="p-0 text-center">
            <p className="text-lg font-semibold text-muted">Belum ada lesson yang selesai</p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link to="/lesson/$lessonId" params={{ lessonId: next.lesson.id }}>
                  Lanjut ke lesson berikutnya
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/">Kembali ke beranda</Link>
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
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
        {/* Celebratory icon */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-success/20 to-accent/20 blur-xl" />
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-success to-accent shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground">
            Lesson selesai!
          </h1>
          <p className="mt-1 text-base font-semibold text-muted">
            {summary.unitName}
          </p>
        </div>

        {/* Stats cards */}
        <div className="flex w-full gap-4">
          <Card className="flex-1 border-2 border-success/20 bg-success/5 p-6 text-center">
            <CardContent className="p-0">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-foreground">
                  {summary.xpEarned}
                </span>
                <span className="text-sm font-bold text-muted">XP</span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">
                Total
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1 border-2 border-accent/20 bg-accent/5 p-6 text-center">
            <CardContent className="p-0">
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-4xl font-black text-foreground">
                  {summary.correctCount}
                </span>
                <span className="text-lg font-bold text-muted">
                  /{summary.totalScreens}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted">
                Score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mastery change */}
        {displayAfter != null && (
          <Card className="w-full border-2 border-border p-4 text-center">
            <CardContent className="p-0">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <p className="text-sm font-bold text-muted">
                  Mastery {summary.unitName}
                </p>
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">
                {displayAfter}%
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wrong screens review */}
        {summary.wrongScreens.length > 0 && (
          <Card className="w-full border-2 border-destructive/20 bg-destructive/5 p-4">
            <CardContent className="p-0">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">
                Perlu diulang
              </h2>
              <div className="flex flex-col gap-2">
                {summary.wrongScreens.map((wrong, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-destructive/20 bg-card p-3"
                  >
                    <p className="text-sm font-medium text-foreground">{wrong.prompt}</p>
                    <p className="mt-1 text-sm text-muted">{wrong.explain}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue button */}
        <Button asChild size="lg" className="w-full">
          <Link to="/lesson/$lessonId" params={{ lessonId: next.lesson.id }}>
            Lanjut
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/">Kembali ke beranda</Link>
        </Button>
      </div>
    </main>
  )
}
