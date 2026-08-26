import { useState } from "react";
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

interface LessonFormDialogProps {
  trigger: React.ReactNode;
  initialValues?: { id: string; title: string };
  onSave: (values: { id: string; title: string }) => void;
}

export function LessonFormDialog({ trigger, initialValues, onSave }: LessonFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(initialValues?.id ?? "");
  const [title, setTitle] = useState(initialValues?.title ?? "");

  function reset() {
    setId(initialValues?.id ?? "");
    setTitle(initialValues?.title ?? "");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !title.trim()) return;
    onSave({ id: id.trim(), title: title.trim() });
    setOpen(false);
    reset();
  }

  const isEdit = !!initialValues;

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
        </form>
        <DialogFooter>
          <Button type="submit" form="lesson-form">
            {isEdit ? "Simpan Perubahan" : "Tambah Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
