import { PlayCircle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { units, nextLesson } from '#/content/index.ts'
import { useProgressStore } from '#/engine/progress/progressStore.ts'

export default function CourseCard() {
  const navigate = useNavigate()
  const mastery = useProgressStore((s) => s.mastery)

  const next = nextLesson(units, mastery)

  function handleStart() {
    navigate({ to: '/lesson/$lessonId', params: { lessonId: next.lesson.id } })
  }

  return (
    <Card className="p-8">
      <CardContent className="p-0 text-center">
        <Badge
          variant="secondary"
          className="mb-4 rounded-full bg-accent/15 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent"
        >
          Lanjut belajar
        </Badge>

        <h2 className="display-title mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          {next.lesson.title}
        </h2>
        <p className="mb-6 text-sm font-bold uppercase tracking-widest text-accent">
          {next.unit.title}
        </p>

        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent/15">
            <PlayCircle className="h-12 w-12 text-accent" />
          </div>
        </div>

        <Button onClick={handleStart} size="lg" className="w-full">
          Lanjut ke lesson berikutnya
        </Button>
      </CardContent>
    </Card>
  )
}
