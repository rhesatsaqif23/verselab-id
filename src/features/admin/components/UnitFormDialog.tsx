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

interface UnitFormDialogProps {
  trigger: React.ReactNode;
  initialValues?: { id: string; title: string; imageUrl?: string };
  onSave: (values: { id: string; title: string; imageUrl?: string }) => void;
}

export function UnitFormDialog({ trigger, initialValues, onSave }: UnitFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(initialValues?.id ?? "");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");

  function reset() {
    setId(initialValues?.id ?? "");
    setTitle(initialValues?.title ?? "");
    setImageUrl(initialValues?.imageUrl ?? "");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !title.trim()) return;
    onSave({ id: id.trim(), title: title.trim(), imageUrl: imageUrl.trim() || undefined });
    setOpen(false);
    reset();
  }

  const isEdit = !!initialValues;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit" : "Tambah Unit"}</DialogTitle>
        </DialogHeader>
        <form id="unit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit-id">ID Unit</Label>
            <Input
              id="unit-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="keuangan"
              disabled={isEdit}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit-title">Judul Unit</Label>
            <Input
              id="unit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Keuangan"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit-image">URL Gambar (opsional)</Label>
            <Input
              id="unit-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/unit/keuangan.webp"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="unit-form">
            {isEdit ? "Simpan Perubahan" : "Tambah Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
