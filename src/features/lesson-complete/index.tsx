import { CheckCircle2, TrendingUp, XCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { useLessonCompleteStore } from './lessonCompleteStore'
import { nextLesson, units } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'

export default function LessonCompletePage() {
  const summary = useLessonCompleteStore((s) => s.summary)
  const mastery = useProgressStore((s) => s.mastery)

  const next = nextLesson(units, mastery)

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

  const masteryDelta =
    summary.masteryBefore != null && summary.masteryAfter != null
      ? summary.masteryAfter - summary.masteryBefore
      : 0

  return (
    <main className="page-wrap px-4 pb-32 pt-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <Card className="p-8">
          <CardContent className="p-0 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-success/20 to-accent/15">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <h1 className="display-title mb-1 text-2xl font-bold text-foreground sm:text-3xl">
              Lesson selesai!
            </h1>
            <p className="text-sm font-semibold text-muted">
              {summary.totalScreens} soal, {summary.correctCount} benar
            </p>

            <div className="mt-6 rounded-2xl border-2 border-border bg-card p-5">
              <p className="text-sm font-bold uppercase tracking-widest text-muted">XP yang didapat</p>
              <p className="mt-1 text-4xl font-black text-(--color-text)">
                +{summary.xpEarned} <span className="text-lg font-bold text-muted">XP</span>
              </p>
            </div>

            <div className="mt-4 rounded-2xl border-2 border-border bg-card p-5">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted">
                  Mastery {summary.unitName}
                </p>
              </div>
              <p className="mt-1 text-3xl font-black text-(--color-text)">
                {summary.masteryBefore ?? summary.masteryAfter}
                <span className="mx-2 text-lg text-muted">→</span>
                {summary.masteryAfter}
                {masteryDelta > 0 && (
                  <span className="ml-2 text-lg font-bold text-success">+{masteryDelta}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {summary.wrongScreens.length > 0 ? (
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="mb-4 text-lg font-bold text-foreground">Perlu diulang</h2>
              <div className="flex flex-col gap-3">
                {summary.wrongScreens.map((wrong, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                      <div>
                        <p className="text-sm font-semibold text-(--color-text)">{wrong.prompt}</p>
                        <p className="mt-1 text-sm text-muted">{wrong.explain}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-6">
            <CardContent className="p-0 text-center">
              <p className="text-base font-bold text-success">Semua benar!</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link to="/lesson/$lessonId" params={{ lessonId: next.lesson.id }}>
              Lanjut ke lesson berikutnya
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
