// ActivityCalendar: weekly activity grid showing active days.
import { Card, CardContent } from "#/components/ui/card";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { getWeekDates, toDateString, todayString } from "#/libs/date.ts";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function ActivityCalendar() {
  const activeDays = useProgressStore((s) => s.activeDays);
  const weekDates = getWeekDates(new Date());
  const today = todayString();

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <p className="text-base font-bold text-foreground mb-3">Aktivitas minggu ini</p>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const dateStr = toDateString(date);
            const isActive = activeDays.includes(dateStr);
            const isToday = dateStr === today;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-muted">{DAY_NAMES[i]}</span>
                <span
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isToday
                        ? "border-2 border-primary text-primary"
                        : "bg-muted/30 text-muted"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
