import { useRef, useState } from "react";
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
import { Textarea } from "#/components/ui/textarea.tsx";
import {
  adminCreateUnit,
  adminUpdateUnit,
  adminUploadUnitImage,
  type AdminUnit,
} from "#/libs/admin-content-fns.ts";

interface UnitFormDialogProps {
  trigger: React.ReactNode;
  unit?: AdminUnit;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UnitFormDialog({ trigger, unit }: UnitFormDialogProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(unit?.id ?? "");
  const [title, setTitle] = useState(unit?.title ?? "");
  const [description, setDescription] = useState(unit?.description ?? "");
  const [previewUrl, setPreviewUrl] = useState(unit?.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { id: string; title: string; description?: string }) =>
      adminCreateUnit({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; description?: string }) =>
      adminUpdateUnit({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  const imageMutation = useMutation({
    mutationFn: (data: { id: string; file: string; filename: string }) =>
      adminUploadUnitImage({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  function reset() {
    setId(unit?.id ?? "");
    setTitle(unit?.title ?? "");
    setDescription(unit?.description ?? "");
    setPreviewUrl(unit?.imageUrl ?? "");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const isEdit = !!unit;

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: unit.id,
          title: title.trim(),
          description: description.trim() || undefined,
        });
        if (selectedFile) {
          const base64 = await fileToBase64(selectedFile);
          await imageMutation.mutateAsync({
            id: unit.id,
            file: base64,
            filename: selectedFile.name,
          });
        }
        toast.success("Unit berhasil diperbarui");
      } else {
        if (!id.trim()) return;
        await createMutation.mutateAsync({
          id: id.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
        });
        if (selectedFile && id.trim()) {
          const base64 = await fileToBase64(selectedFile);
          await imageMutation.mutateAsync({
            id: id.trim(),
            file: base64,
            filename: selectedFile.name,
          });
        }
        toast.success("Unit berhasil ditambahkan");
      }
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan unit");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const isEdit = !!unit;
  const isPending = createMutation.isPending || updateMutation.isPending || imageMutation.isPending;

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
            <Label htmlFor="unit-desc">Deskripsi (opsional)</Label>
            <Textarea
              id="unit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang unit ini"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit-image">Gambar (opsional)</Label>
            <input
              ref={fileRef}
              id="unit-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="flex items-center gap-3">
                <img src={previewUrl} alt="Preview" className="size-16 rounded object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(unit?.imageUrl ?? "");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Pilih Gambar
              </Button>
            )}
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="unit-form" disabled={isPending}>
            {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
