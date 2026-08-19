// LessonControls: bottom action buttons per player phase (concept/answering/checked).
import { Button } from '#/components/ui/button.tsx'

type LessonControlsProps = {
  mode: 'concept' | 'answering' | 'checked'
  hasAnswer: boolean
  hasExplain: boolean
  onCheck: () => void
  onContinue: () => void
  onExplain: () => void
}

export default function LessonControls({
  mode,
  hasAnswer,
  hasExplain,
  onCheck,
  onContinue,
  onExplain,
}: LessonControlsProps) {
  return (
    <div className="mx-auto w-full max-w-md flex min-h-20 flex-col gap-3 pt-4">
      {mode === 'concept' ? (
        <Button
          key={mode}
          variant="default"
          size="lg"
          onClick={onContinue}
          className="w-full animate-slide-up-enter"
        >
          Lanjut
        </Button>
      ) : mode === 'answering' ? (
        <Button
          key={mode}
          variant="default"
          size="lg"
          disabled={!hasAnswer}
          onClick={onCheck}
          className="w-full animate-slide-up-enter disabled:bg-none disabled:bg-(--lesson-btn-disabled-bg) disabled:text-(--lesson-btn-disabled-text) disabled:opacity-50 disabled:shadow-[0_5px_0_0_var(--lesson-btn-disabled-shadow),0_6px_16px_rgba(0,0,0,0.12)]"
        >
          Cek Jawaban
        </Button>
      ) : (
        <div key={mode} className="flex animate-slide-up-enter gap-3">
          {hasExplain && (
            <Button
              variant="outline"
              size="lg"
              onClick={onExplain}
              className="shrink-0"
            >
              Kenapa?
            </Button>
          )}
          <Button
            variant="default"
            size="lg"
            onClick={onContinue}
            className="flex-1"
          >
            Lanjut
          </Button>
        </div>
      )}
    </div>
  )
}
