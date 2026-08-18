// LessonHeader: top bar with exit button, progress bar, and live XP badge.
import { Button } from '#/components/ui/button.tsx'
import ProgressBar from './ProgressBar.tsx'

type LessonHeaderProps = {
  current: number
  total: number
  xpEarned: number
  onExit: () => void
}

export default function LessonHeader({
  current,
  total,
  xpEarned,
  onExit,
}: LessonHeaderProps) {
  return (
    <div className="flex gap-4 md:gap-16">
      <Button variant="ghost" size="icon" onClick={onExit} aria-label="Keluar" className="shrink-0">
        ✕
      </Button>
      <ProgressBar current={current} total={total} />
      <div className="shrink-0 flex items-center gap-1 rounded-full border-2 border-border px-3 py-1.5 text-md font-bold text-foreground">
        <span>{xpEarned}</span>
        <span className="text-sm font-bold text-muted">XP</span>
      </div>
    </div>
  )
}
