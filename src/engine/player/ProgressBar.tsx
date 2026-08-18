// ProgressBar: segmented progress indicators and the current/total counter.
type ProgressBarProps = {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-1.5 px-8">
      <div className="mx-auto flex w-full max-w-md gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-3 min-w-0 flex-1 rounded-full transition-colors ${
              i < current ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <span className="text-center text-lg font-bold text-muted">
        {current} / {total}
      </span>
    </div>
  )
}
