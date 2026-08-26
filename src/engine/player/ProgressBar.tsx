// ProgressBar: segmented progress indicators and the current/total counter.
type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex w-full flex-1 flex-col gap-1.5 px-8">
      <div className="mx-auto flex w-full max-w-lg gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const isCompleted = i < current - 1;
          const isCurrent = i === current - 1;

          return (
            <div
              key={i}
              className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-border"
            >
              <div
                className={`h-full w-full rounded-full transition-all duration-500 ease-out ${
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                      ? "bg-chart-3"
                      : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
      <span className="text-center text-lg font-bold text-muted">
        {current} / {total}
      </span>
    </div>
  );
}
