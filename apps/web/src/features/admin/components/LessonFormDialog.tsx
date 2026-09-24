import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { resolveImageUrl } from "#/libs/image.ts";
import { ImageUpload } from "./ImageUpload.tsx";
import {
  adminCreateLesson,
  adminUpdateLesson,
  adminUploadLessonImage,
  adminGetAllLessons,
  translateAdminError,
  type AdminLesson,
} from "#/libs/admin-content-fns.ts";

interface LessonFormDialogProps {
  trigger: React.ReactNode;
  unitId: string;
  lesson?: AdminLesson;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function LessonFormDialog({ trigger, unitId, lesson }: LessonFormDialogProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>([]);

  const { data: allLessons = [] } = useQuery({
    queryKey: ["admin-all-lessons"],
    queryFn: () => adminGetAllLessons(),
  });

  const otherLessons = (allLessons ?? []).filter((l) => l.unitId === unitId && l.id !== lesson?.id);

  const createMutation = useMutation({
    mutationFn: (data: {
      id?: string;
      unitId: string;
      title: string;
      description?: string;
      icon?: string;
      prerequisiteIds?: string[];
    }) => adminCreateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string | null;
      icon?: string;
      prerequisiteIds?: string[] | null;
    }) => adminUpdateLesson({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  const imageMutation = useMutation({
    mutationFn: (data: { id: string; file: string; filename: string }) =>
      adminUploadLessonImage({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  function reset() {
    setTitle("");
    setDescription("");
    setIcon("");
    setPreviewUrl("");
    setSelectedFile(null);
    setPrerequisiteIds([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTitle(lesson?.title ?? "");
      setDescription(lesson?.description ?? "");
      setIcon(lesson?.icon ?? "");
      setPreviewUrl(resolveImageUrl(lesson?.imageUrl) ?? "");
      setSelectedFile(null);
      setPrerequisiteIds(lesson?.prerequisiteIds ?? []);
    } else {
      reset();
    }
  }

  function togglePrerequisite(id: string) {
    setPrerequisiteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
          prerequisiteIds: prerequisiteIds.length > 0 ? prerequisiteIds : null,
        });
        if (selectedFile) {
          const base64 = await fileToBase64(selectedFile);
          await imageMutation.mutateAsync({
            id: lesson.id,
            file: base64,
            filename: selectedFile.name,
          });
        }
        toast.success("Lesson berhasil diperbarui");
      } else {
        const result = await createMutation.mutateAsync({
          unitId,
          title: title.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          prerequisiteIds: prerequisiteIds.length > 0 ? prerequisiteIds : undefined,
        });
        const newId = result?.id;
        if (selectedFile && newId) {
          const base64 = await fileToBase64(selectedFile);
          await imageMutation.mutateAsync({
            id: newId,
            file: base64,
            filename: selectedFile.name,
          });
        }
        toast.success("Lesson berhasil ditambahkan");
      }
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(translateAdminError(err, "Gagal menyimpan lesson"));
    }
  }

  function handleImageSelect(file: File) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageClear() {
    setSelectedFile(null);
    setPreviewUrl("");
  }

  const isEdit = !!lesson;
  const isPending = createMutation.isPending || updateMutation.isPending || imageMutation.isPending;

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
            <Label htmlFor="lesson-icon">Icon (opsional, fallback jika tanpa gambar)</Label>
            <Input
              id="lesson-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="&#128176;"
            />
          </div>
          <ImageUpload
            id="lesson-image"
            previewUrl={previewUrl}
            onFileSelect={handleImageSelect}
            onClear={handleImageClear}
            inputRef={fileRef}
          />
          {otherLessons.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Prasyarat (opsional)</Label>
              <p className="text-xs text-muted-foreground">
                Pilih lesson yang harus diselesaikan terlebih dahulu.
              </p>
              <div className="flex flex-wrap gap-2">
                {otherLessons.map((l) => {
                  const isSelected = prerequisiteIds.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => togglePrerequisite(l.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {l.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
