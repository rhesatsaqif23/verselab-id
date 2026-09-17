import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload, UploadCloud } from "lucide-react";
import { slugify } from "@verselab/shared/slug";
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
import { cn } from "#/libs/utils.ts";
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

  const createMutation = useMutation({
    mutationFn: (data: { id?: string; title: string; description?: string }) =>
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
    setTitle(EMPTY_TITLE);
    setDescription(EMPTY_DESCRIPTION);
    setPreviewUrl("");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul Unit wajib diisi");
      return;
    }

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
        const result = await createMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
        });
        const newId = result?.ok ? result.data.id : undefined;
        if (selectedFile && newId) {
          const base64 = await fileToBase64(selectedFile);
          await imageMutation.mutateAsync({
            id: newId,
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
            <Label htmlFor="unit-slug">Slug (otomatis dari judul)</Label>
            <Input
              id="unit-slug"
              value={title.trim() ? slugify(title) : ""}
              disabled
              placeholder="keuangan"
              className="font-mono text-xs text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Slug dibuat otomatis dari judul dan dijamin tidak duplikat.
            </p>
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
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
              className={cn(
                "group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
                previewUrl
                  ? "border-border bg-white"
                  : "border-primary/50 bg-white hover:border-primary hover:bg-primary/5",
              )}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="size-full object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileRef.current?.click();
                      }}
                    >
                      <Upload className="size-3.5" />
                      Ganti
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl("");
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    <UploadCloud className="size-5" />
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-semibold text-foreground">
                    Klik atau seret gambar ke sini
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    PNG, JPG, WEBP, atau SVG
                  </span>
                </div>
              )}
            </div>
          </div>
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
