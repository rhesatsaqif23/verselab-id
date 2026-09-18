import { useState } from "react";
import { toast } from "sonner";
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

const EMPTY_TITLE = "";
const EMPTY_DESCRIPTION = "";
const EMPTY_ICON = "";
const EMPTY_PREREQUISITE = "";

interface LessonFormDialogProps {
  trigger: React.ReactNode;
  unitId: string;
  lesson?: AdminLesson;
}

export function LessonFormDialog({ trigger, unitId, lesson }: LessonFormDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(EMPTY_TITLE);
  const [description, setDescription] = useState(EMPTY_DESCRIPTION);
  const [icon, setIcon] = useState(EMPTY_ICON);
  const [prerequisite, setPrerequisite] = useState(EMPTY_PREREQUISITE);

  const createMutation = useMutation({
    mutationFn: (data: {
      id?: string;
      unitId: string;
      title: string;
      description?: string;
      icon?: string;
      prerequisite?: string;
    }) => adminCreateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string | null;
      icon?: string;
      prerequisite?: string | null;
    }) => adminUpdateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  function reset() {
    setTitle(EMPTY_TITLE);
    setDescription(EMPTY_DESCRIPTION);
    setIcon(EMPTY_ICON);
    setPrerequisite(EMPTY_PREREQUISITE);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTitle(lesson?.title ?? EMPTY_TITLE);
      setDescription(lesson?.description ?? EMPTY_DESCRIPTION);
      setIcon(lesson?.icon ?? EMPTY_ICON);
      setPrerequisite(lesson?.prerequisite ?? EMPTY_PREREQUISITE);
    } else {
      reset();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul Lesson wajib diisi");
      return;
    }

    try {
      if (lesson) {
        await updateMutation.mutateAsync({
          id: lesson.id,
          title: title.trim(),
          description: description.trim() || null,
          icon: icon.trim() || undefined,
          prerequisite: prerequisite.trim() || null,
        });
        toast.success("Lesson berhasil diperbarui");
      } else {
        await createMutation.mutateAsync({
          unitId,
          title: title.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          prerequisite: prerequisite.trim() || undefined,
        });
        toast.success("Lesson berhasil ditambahkan");
      }
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan lesson");
    }
  }

  const isEdit = !!lesson;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lesson" : "Tambah Lesson"}</DialogTitle>
        </DialogHeader>
        <form id="lesson-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label>ID Lesson</Label>
              <Input
                value={lesson.id}
                disabled
                className="font-mono text-xs text-muted-foreground"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-title">
              Judul Lesson <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mulai Menabung"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-description">Deskripsi (opsional)</Label>
            <Input
              id="lesson-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pahami konsep dan latihan interaktif untuk menguasai topik ini."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-icon">Icon (opsional)</Label>
            <Input
              id="lesson-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="&#128176;"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-prereq">Prasyarat (opsional)</Label>
            <Input
              id="lesson-prereq"
              value={prerequisite}
              onChange={(e) => setPrerequisite(e.target.value)}
              placeholder="Disarankan selesaikan ... terlebih dahulu."
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
