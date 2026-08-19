// ProgressBar: segmented progress indicators and the current/total counter.
type ProgressBarProps = {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-1.5 px-8">
      <div className="mx-auto flex w-full max-w-md gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          // Completed steps (before current index) are filled
          const isFilled = i < current - 1

          return (
            <div
              key={i}
              className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-border"
            >
              <div
                className="h-full w-full rounded-full bg-primary transition-transform duration-500 ease-out"
                style={{
                  transform: isFilled ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />
            </div>
          )
        })}
      </div>
      <span className="text-center text-lg font-bold text-muted">
        {current} / {total}
      </span>
    </div>
  )
}
