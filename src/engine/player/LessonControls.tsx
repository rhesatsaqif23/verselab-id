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
          variant="default"
          size="lg"
          onClick={onContinue}
          className="w-full"
        >
          Lanjut
        </Button>
      ) : mode === 'answering' ? (
        <Button
          variant="default"
          size="lg"
          disabled={!hasAnswer}
          onClick={onCheck}
          className="w-full disabled:opacity-60"
        >
          Cek Jawaban
        </Button>
      ) : (
        <div className="flex gap-3">
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
