import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
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

function resolvePrereqs(lesson: Lesson, allLessons: Lesson[]): Lesson[] {
  const byId = new Map(allLessons.map((l) => [l.id, l]));
  return (lesson.prerequisiteIds ?? [])
    .map((id) => byId.get(id))
    .filter((prereq): prereq is Lesson => prereq !== undefined);
}

/**
 * Prerequisites of `lesson` that are not finished yet. Ids that no longer
 * resolve to a lesson are stale references, so they never block the learner.
 */
export function unmetPrerequisites(
  lesson: Lesson,
  allLessons: Lesson[],
  completedLessons: string[],
): Lesson[] {
  return resolvePrereqs(lesson, allLessons).filter((l) => !completedLessons.includes(l.id));
}

export function PrerequisiteDialog({
  open,
  onOpenChange,
  lesson,
  allLessons,
  completedLessons,
}: PrerequisiteDialogProps) {
  const prereqs = resolvePrereqs(lesson, allLessons);
  const metPrereqs = prereqs.filter((l) => completedLessons.includes(l.id));
  const unmetPrereqs = prereqs.filter((l) => !completedLessons.includes(l.id));

  if (unmetPrereqs.length === 0) return null;

  const previousLesson = unmetPrereqs[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Prasyarat belum terpenuhi
          </DialogTitle>
          <DialogDescription>
            Lesson berikut disarankan untuk diselesaikan terlebih dahulu sebelum memulai{" "}
            <span className="font-semibold text-foreground">{lesson.title}</span>. Kamu tetap bisa
            lanjut tanpa menyelesaikannya.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {metPrereqs.map((prereq) => (
            <div
              key={prereq.id}
              className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">{prereq.title}</span>
              <span className="ml-auto text-xs text-success">Selesai</span>
            </div>
          ))}
          {unmetPrereqs.map((prereq) => (
            <div
              key={prereq.id}
              className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2"
            >
              <span className="text-sm font-medium text-foreground">{prereq.title}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-row gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: previousLesson.id }}
              onClick={() => onOpenChange(false)}
            >
              Lesson Sebelumnya
            </Link>
          </Button>
          <Button asChild>
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: lesson.id }}
              onClick={() => onOpenChange(false)}
            >
              Tetap Lanjut
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
