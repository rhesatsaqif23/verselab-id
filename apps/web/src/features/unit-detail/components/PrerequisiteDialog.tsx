import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import type { Lesson } from "#/engine/types.ts";

type PrerequisiteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: Lesson;
  allLessons: Lesson[];
  completedLessons: string[];
};

export function PrerequisiteDialog({
  open,
  onOpenChange,
  lesson,
  allLessons,
  completedLessons,
}: PrerequisiteDialogProps) {
  const prereqIds = lesson.prerequisiteIds ?? [];
  const unmetPrereqs = prereqIds.filter((id) => !completedLessons.includes(id));
  const metPrereqs = prereqIds.filter((id) => completedLessons.includes(id));

  if (prereqIds.length === 0) return null;

  const firstUnmetId = unmetPrereqs[0];
  const firstUnmetLesson = allLessons.find((l) => l.id === firstUnmetId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Prasyarat belum terpenuhi
          </DialogTitle>
          <DialogDescription>
            Kamu perlu menyelesaikan lesson berikut terlebih dahulu sebelum memulai{" "}
            <span className="font-semibold text-foreground">{lesson.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {metPrereqs.map((id) => {
            const prereqLesson = allLessons.find((l) => l.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2"
              >
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="text-sm font-medium text-foreground">
                  {prereqLesson?.title ?? id}
                </span>
                <span className="ml-auto text-xs text-success">Selesai</span>
              </div>
            );
          })}
          {unmetPrereqs.map((id) => {
            const prereqLesson = allLessons.find((l) => l.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2"
              >
                <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                <span className="text-sm font-medium text-foreground">
                  {prereqLesson?.title ?? id}
                </span>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex flex-row gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          {firstUnmetLesson && (
            <Button asChild>
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: firstUnmetLesson.id }}
                onClick={() => onOpenChange(false)}
              >
                Mulai Prasyarat
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
