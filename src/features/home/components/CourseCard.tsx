import { BarChart3, CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'

interface CourseCardProps {
  onStart?: () => void
}

export default function CourseCard({ onStart }: CourseCardProps) {
  return (
    <Card className="p-6 sm:p-8">
      <CardContent className="p-0">
        <div className="mb-6 text-center">
          <h2 className="display-title mb-1 text-2xl font-bold text-foreground sm:text-3xl">
            Project Management Basics
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Level 1
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
            <BarChart3 className="h-14 w-14 text-primary" />
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">Warm Up</span>
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <span className="flex-1 text-sm font-medium text-muted-foreground">
              Understanding Gantt Charts
            </span>
            <div className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
        </div>

        <Button onClick={onStart} size="lg" className="w-full">
          Start
        </Button>
      </CardContent>
    </Card>
  )
}
