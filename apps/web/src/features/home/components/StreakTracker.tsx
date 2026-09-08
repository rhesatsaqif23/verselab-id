// StreakTracker: shows current streak and a Mon–Sun weekly activity checklist.
import { Flame } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { getWeekDates, toDateString } from "#/libs/date.ts";
import { cn } from "#/libs/utils.ts";
import { WEEKDAY_LABELS } from "../constants.ts";

export default function StreakTracker() {
  const streak = useProgressStore((s) => s.streak);
  const activeDays = useProgressStore((s) => s.activeDays);
  const lastActiveDate = useProgressStore((s) => s.lastActiveDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateString(today);
  const weekDates = getWeekDates(today);
  const activeDaySet = new Set([
    ...activeDays,
    // If today's streak is active (lastActiveDate === today), mark today as done
    ...(lastActiveDate === todayStr && streak > 0 ? [todayStr] : []),
  ]);

  // Day labels in Indonesian week order: Mon–Sun
  const dayLabels = WEEKDAY_LABELS;

  return (
    <Card className="border-2 border-border p-5">
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-start gap-4">
          {/* Fire icon badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fire-light">
            <Flame className="h-7 w-7 fill-fire text-fire" />
          </div>

          {/* Streak info */}
          <div>
            <p className="text-base font-bold">Streak harian</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-foreground leading-none">{streak}</span>
              <span className="text-sm font-medium text-muted">hari berturut-turut</span>
            </div>
          </div>
        </div>

        {/* Weekly day checklist */}
        <div className="mt-5 grid grid-cols-7 gap-1">
          {weekDates.map((date, i) => {
            const dateStr = toDateString(date);
            const isToday = dateStr === todayStr;
            const isDone = activeDaySet.has(dateStr);

            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5">
                {/* Day label */}
                <span className={cn("text-xs font-bold", isToday ? "text-primary" : "text-muted")}>
                  {dayLabels[i]}
                </span>

                {/* Day circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-fire bg-fire-light"
                      : isToday
                        ? "border-primary bg-primary/10"
                        : "border-border bg-transparent",
                  )}
                >
                  {isDone && <Flame className="h-4 w-4 fill-fire text-fire" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer message */}
        <p className="mt-4 text-sm font-medium">Belajar setiap hari untuk menjaga streak!</p>
      </CardContent>
    </Card>
  );
}
