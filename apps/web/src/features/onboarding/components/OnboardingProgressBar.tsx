// OnboardingProgressBar: segmented progress indicator matching the lesson
// player's visual language (segmented bars, not a percentage fill).
type OnboardingProgressBarProps = {
  current: number;
  total: number;
};

export default function OnboardingProgressBar({ current, total }: OnboardingProgressBarProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;
          return (
            <div
              key={i}
              className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-border"
            >
              <div
                className={`h-full w-full rounded-full transition-all duration-500 ease-out ${
                  isCompleted ? "bg-primary" : isCurrent ? "bg-chart-3" : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
      <span className="text-center text-sm font-bold text-muted">
        {Math.min(current, total)} / {total}
      </span>
    </div>
  );
}
