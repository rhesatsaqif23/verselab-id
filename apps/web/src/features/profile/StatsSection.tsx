// StatsSection: 2x2 stat cards matching Statistik style.
import { Flame, Zap, BookOpen, Target } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { type DailyGoal } from "@verselab/shared/schemas/profile";

const GOAL_LABEL: Record<DailyGoal, string> = {
  casual: "5m",
  regular: "10m",
  serious: "20m",
};

export default function StatsSection({ dailyGoal }: { dailyGoal: DailyGoal }) {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const completedLessons = useProgressStore((s) => s.completedLessons);

  const stats = [
    {
      icon: <Flame className="size-5 text-fire" />,
      value: streak,
      label: "Runtunan hari",
    },
    {
      icon: <Zap className="size-5 text-accent" />,
      value: xp,
      label: "Total XP",
    },
    {
      icon: <BookOpen className="size-5 text-primary" />,
      value: completedLessons.length,
      label: "Lesson selesai",
    },
    {
      icon: <Target className="size-5 text-muted" />,
      value: GOAL_LABEL[dailyGoal],
      label: "Goal harian",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <CardContent className="p-0 flex items-center gap-3">
            {s.icon}
            <div className="min-w-0">
              <p className="text-xl font-black text-foreground">{s.value}</p>
              <p className="text-sm text-muted truncate">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
