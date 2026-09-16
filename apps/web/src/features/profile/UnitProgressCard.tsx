// UnitProgressCard: per-unit progress with unit image.
import { Card, CardContent } from "#/components/ui/card";
import { findUnit } from "#/content/index.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";

type Props = { unitId: string; title: string; description?: string; imageUrl: string };

export default function UnitProgressCard({ unitId, title, description, imageUrl }: Props) {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const unit = findUnit(unitId);
  const lessons = unit?.lessons ?? [];
  const doneCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <img
          src={imageUrl}
          alt={title}
          className="size-14 shrink-0 rounded-2xl object-cover"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">{title}</p>
            <span className="text-sm font-medium text-muted shrink-0 ml-2">
              {doneCount}/{lessons.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {description && (
            <p className="text-sm text-muted truncate">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
