// UnitCard: single card for one unit with next lesson, mastery progress, and CTA.
import { PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { todayString } from "#/libs/date.ts";
import { decayedMastery } from "#/engine/progress/decay.ts";
import { units } from "#/content/index.ts";

type UnitCardProps = {
  unit: Unit;
};

export default function UnitCard({ unit }: UnitCardProps) {
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const mastery = useProgressStore((s) => s.mastery);
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt);
  const today = todayString();

  // Find the current active lesson (first uncompleted lesson, or fallback to first lesson)
  const currentLessonIndex = unit.lessons.findIndex((l) => !completedLessons.includes(l.id));
  const activeIndex = currentLessonIndex !== -1 ? currentLessonIndex : 0;
  const currentLesson = unit.lessons[activeIndex] ?? unit.lessons[0];

  // Find recommended unit: the first unlocked unit that is not fully mastered (mastery < 100).
  const recommendedUnitId = (() => {
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      const uMasteryValue = mastery[u.id] ?? 0;
      const uMastery = decayedMastery(uMasteryValue, updatedAt[u.id], today);

      const prevUnlocked =
        i === 0 ||
        (() => {
          const prevU = units[i - 1];
          const prevMasteryValue = mastery[prevU.id] ?? 0;
          const prevMastery = decayedMastery(prevMasteryValue, updatedAt[prevU.id], today);
          return prevMastery >= 100;
        })();

      if (prevUnlocked && uMastery < 100) {
        return u.id;
      }
    }
    return units[0]?.id;
  })();

  const isRecommended = unit.id === recommendedUnitId;

  return (
    <Card className="group relative overflow-hidden border-2 border-border p-0 transition-all hover:border-primary/40 cursor-grab">
      <CardContent className="p-0">
        <div className="relative flex flex-col items-center gap-5 px-8 py-8 text-center">
          {/* Soft radial bg decoration */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(21,145,220,0.10)_0%,transparent_70%)]" />

          {/* Badge */}
          <div className="flex h-6 items-center justify-center">
            {isRecommended && (
              <Badge className="relative rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                Rekomendasi
              </Badge>
            )}
          </div>

          {/* Unit title */}
          <h2 className="relative line-clamp-2 h-14 text-2xl font-black leading-snug text-foreground sm:text-2xl">
            {unit.title}
          </h2>

          {/* Illustration */}
          <img
            src={unit.imageUrl || "/course-illustration.png"}
            alt={`Ilustrasi ${unit.title}`}
            draggable={false}
            className="pointer-events-none relative h-36 w-auto select-none object-contain sm:h-40"
          />

          {/* Current lesson indicator row (replacing progress bar) */}
          {currentLesson && (
            <div className="relative z-10 flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-left shadow-xs backdrop-blur-xs">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white shadow-sm ring-2 ring-primary/30">
                  <span className="text-sm">{activeIndex + 1}</span>
                </div>
                <span className="truncate text-sm font-bold text-foreground">
                  {currentLesson.title}
                </span>
              </div>
            </div>
          )}

          {/* CTA button: Mulai opening current lesson directly */}
          {currentLesson && (
            <Button asChild size="lg" className="relative z-10 mt-1 w-full pointer-events-auto">
              <Link to="/lesson/$lessonId" params={{ lessonId: currentLesson.id }}>
                <PlayCircle className="mr-2 size-6" />
                Mulai
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
