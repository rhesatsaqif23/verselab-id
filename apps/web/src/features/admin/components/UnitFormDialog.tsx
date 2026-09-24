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
import { resolveImageUrl } from "#/libs/image.ts";
import { ImageUpload } from "./ImageUpload.tsx";
import {
  adminCreateUnit,
  adminUpdateUnit,
  adminUploadUnitImage,
  translateAdminError,
  type AdminUnit,
} from "#/libs/admin-content-fns.ts";

interface UnitFormDialogProps {
  trigger: React.ReactNode;
  unit?: AdminUnit;
}

const EMPTY_TITLE = "";
const EMPTY_DESCRIPTION = "";

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
  const [title, setTitle] = useState(EMPTY_TITLE);
  const [description, setDescription] = useState(EMPTY_DESCRIPTION);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: { id?: string; title: string; description?: string }) =>
      adminCreateUnit({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string;
      imageUrl?: string | null;
    }) => adminUpdateUnit({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  const imageMutation = useMutation({
    mutationFn: (data: { id: string; file: string; filename: string; fileType: string }) =>
      adminUploadUnitImage({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
  });

  function reset() {
    setTitle(EMPTY_TITLE);
    setDescription(EMPTY_DESCRIPTION);
    setPreviewUrl("");
    setSelectedFile(null);
    setRemoveImage(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTitle(unit?.title ?? EMPTY_TITLE);
      setDescription(unit?.description ?? EMPTY_DESCRIPTION);
      setPreviewUrl(resolveImageUrl(unit?.imageUrl) ?? "");
      setSelectedFile(null);
      setRemoveImage(false);
    } else {
      reset();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul Unit wajib diisi");
      return;
    }

    const isEdit = !!unit;

    try {
      let targetId: string | undefined;
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: unit.id,
          title: title.trim(),
          description: description.trim() || undefined,
          imageUrl: removeImage ? null : undefined,
        });
        targetId = unit.id;
        toast.success("Unit berhasil diperbarui");
      } else {
        const result = await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        targetId = result?.id;
        toast.success("Unit berhasil ditambahkan");
      }
      // Close immediately so Tambah/Simpan always dismisses; the image
      // uploads in the background with its own feedback.
      const file = selectedFile;
      const filename = file?.name;
      const fileType = file?.type;
      setOpen(false);
      reset();
      if (file && targetId) {
        try {
          const base64 = await fileToBase64(file);
          await imageMutation.mutateAsync({
            id: targetId,
            file: base64,
            filename: filename ?? "",
            fileType: fileType ?? "image/png",
          });
          toast.success("Gambar berhasil diunggah");
        } catch (imgErr) {
          toast.error(translateAdminError(imgErr, "Unit tersimpan, tetapi gambar gagal diunggah"));
        }
      }
    } catch (err) {
      toast.error(translateAdminError(err, "Gagal menyimpan unit"));
    }
  }

  function handleImageSelect(file: File) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleImageClear() {
    setSelectedFile(null);
    setPreviewUrl("");
    // Only meaningful when an image is already stored server-side.
    if (unit?.imageUrl) setRemoveImage(true);
  }

  const isEdit = !!unit;
  const isPending = createMutation.isPending || updateMutation.isPending || imageMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit" : "Tambah Unit"}</DialogTitle>
        </DialogHeader>
        <form id="unit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label>ID Unit</Label>
              <Input value={unit.id} disabled className="font-mono text-xs text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="unit-title">
              Judul Unit <span className="text-destructive">*</span>
            </Label>
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
          <ImageUpload
            id="unit-image"
            previewUrl={previewUrl}
            onFileSelect={handleImageSelect}
            onClear={handleImageClear}
            inputRef={fileRef}
          />
        </form>
        <DialogFooter className="sm:justify-center justify-center">
          <Button type="submit" form="unit-form" disabled={isPending} className="min-w-36">
            {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
