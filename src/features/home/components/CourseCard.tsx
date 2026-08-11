import { Clock, Lock } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'

interface CourseCardProps {
  onStart?: () => void
}

export default function CourseCard({ onStart }: CourseCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-3xl border-2 border-border bg-card" />
      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-3xl border-2 border-border bg-card" />

      <Card className="relative z-10 p-8">
        <CardContent className="p-0 text-center">
          <Badge
            variant="secondary"
            className="mb-4 rounded-full bg-accent/15 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent"
          >
            Recommended
          </Badge>

          <h2 className="display-title mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Project Management Basics
          </h2>
          <p className="mb-8 text-sm font-bold uppercase tracking-widest text-accent">
            Level 1
          </p>

          <div className="mb-8 flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="absolute h-20 w-28 rounded-lg bg-(--color-accent/25)" />
              <div className="absolute h-12 w-32 rounded-full bg-(--color-accent/40)" style={{ transform: 'translateY(-16px)' }} />
              <div className="absolute h-12 w-32 rounded-full bg-(--color-accent/30)" style={{ transform: 'translateY(16px)' }} />
              <div className="absolute h-10 w-10 rounded-full bg-(--color-accent/50)" style={{ transform: 'translate(20px, -10px)' }} />
              <div className="absolute h-8 w-8 rounded-full bg-(--color-accent/60)" style={{ transform: 'translate(-18px, 12px)' }} />
            </div>
          </div>

          <p className="mb-6 flex items-center justify-center gap-2 text-sm text-muted">
            <Clock className="h-4 w-4" />
            You're out of keys for today
          </p>

          <div className="mb-6 flex items-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3 text-left">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
              <div className="absolute inset-0 rounded-full border-4 border-accent opacity-20" />
              <Lock className="relative z-10 h-5 w-5 text-accent" />
            </div>
            <span className="flex-1 text-base font-semibold text-(--color-text)">
              Manipulating Numbers
            </span>
            <div className="h-4 w-4 rounded-full bg-border" />
          </div>

          <Button onClick={onStart} size="lg" className="w-full">
            Unlock all lessons now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
