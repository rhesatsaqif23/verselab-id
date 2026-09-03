// UnitInfoCard: left sticky panel with unit image, title, description, counts, and CTA.
import { BookOpen, Layers, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import type { Unit } from "#/engine/types.ts";

type UnitInfoCardProps = {
  unit: Unit;
  activeLessonId: string | undefined;
  hasStarted: boolean;
};

export default function UnitInfoCard({ unit, activeLessonId, hasStarted }: UnitInfoCardProps) {
  const lessonCount = unit.lessons.length;
  const exerciseCount = unit.lessons.reduce((sum, l) => sum + l.screens.length, 0);

  return (
    <Card className="overflow-hidden border-2 border-border">
      <CardContent className="flex flex-col gap-5 p-6">
        {/* Unit image */}
        {unit.imageUrl && (
          <img
            src={unit.imageUrl}
            alt={`Ilustrasi ${unit.title}`}
            draggable={false}
            className="h-20 w-20 object-contain select-none pointer-events-none"
          />
        )}

        {/* Title */}
        <h1 className="text-3xl font-black leading-tight text-foreground">{unit.title}</h1>

        {/* Description */}
        {unit.description && (
          <p className="text-base leading-relaxed text-muted">{unit.description}</p>
        )}

        {/* Counts */}
        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4 shrink-0" />
            {lessonCount} Lesson
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="size-4 shrink-0" />
            {exerciseCount} Soal
          </span>
        </div>

        {/* CTA — only if there's an active lesson */}
        {activeLessonId && (
          <Button asChild size="lg" className="mt-1 w-full">
            <Link to="/lesson/$lessonId" params={{ lessonId: activeLessonId }}>
              <PlayCircle className="mr-2 size-5" />
              {hasStarted ? "Lanjutkan" : "Mulai"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
