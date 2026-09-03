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
  const mastery = useProgressStore((s) => s.mastery);
  const updatedAt = useProgressStore((s) => s.masteryUpdatedAt);
  const today = todayString();

  const masteryValue = mastery[unit.id] ?? 0;
  const masteryDisplay = decayedMastery(masteryValue, updatedAt[unit.id], today);

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
    <Card className="overflow-hidden border-2 border-border p-0">
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
            className="relative h-36 w-auto object-contain sm:h-40 pointer-events-none select-none"
          />
          {/* Progress bar */}
          <div className="relative w-full">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Progres lesson</span>
              <span className="text-sm font-bold text-muted">{masteryDisplay}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${masteryDisplay}%` }}
              />
            </div>
          </div>

          {/* CTA button */}
          <Button asChild size="lg" className="relative w-full mt-2">
            <Link to="/units/$unitId" params={{ unitId: unit.id }}>
              <PlayCircle className="size-6 mr-2" />
              Buka Unit
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
