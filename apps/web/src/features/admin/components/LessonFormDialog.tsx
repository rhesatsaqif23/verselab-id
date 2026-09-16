import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
  adminCreateLesson,
  adminUpdateLesson,
  type AdminLesson,
} from "#/libs/admin-content-fns.ts";

interface LessonFormDialogProps {
  trigger: React.ReactNode;
  unitId: string;
  lesson?: AdminLesson;
}

export function LessonFormDialog({ trigger, unitId, lesson }: LessonFormDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(lesson?.id ?? "");
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [icon, setIcon] = useState(lesson?.icon ?? "");

  const createMutation = useMutation({
    mutationFn: (data: { id: string; unitId: string; title: string; icon?: string }) =>
      adminCreateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; icon?: string }) =>
      adminUpdateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  function reset() {
    setId(lesson?.id ?? "");
    setTitle(lesson?.title ?? "");
    setIcon(lesson?.icon ?? "");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (lesson) {
      await updateMutation.mutateAsync({
        id: lesson.id,
        title: title.trim(),
        icon: icon.trim() || undefined,
      });
    } else {
      if (!id.trim()) return;
      await createMutation.mutateAsync({
        id: id.trim(),
        unitId,
        title: title.trim(),
        icon: icon.trim() || undefined,
      });
    }

    setOpen(false);
    reset();
  }

  const isEdit = !!lesson;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lesson" : "Tambah Lesson"}</DialogTitle>
        </DialogHeader>
        <form id="lesson-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-id">ID Lesson</Label>
            <Input
              id="lesson-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="nabung-awal"
              disabled={isEdit}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-title">Judul Lesson</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mulai Menabung"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-icon">Icon (opsional)</Label>
            <Input
              id="lesson-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="💰"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="lesson-form" disabled={isPending}>
            {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
