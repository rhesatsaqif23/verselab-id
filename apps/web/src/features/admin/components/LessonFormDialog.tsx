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
import { trackImageUpload } from "../hooks/useImageUpload.ts";

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

/**
 * True when `fromId` already (transitively) depends on `targetId` — selecting
 * `fromId` as a prerequisite of `targetId` would create a cycle.
 */
export function reachesPrerequisite(
  all: { id: string; prerequisiteIds: string[] | null }[],
  fromId: string,
  targetId: string,
): boolean {
  const edges = new Map(all.map((l) => [l.id, l.prerequisiteIds ?? []]));
  const stack = [fromId];
  const seen = new Set<string>();
  while (stack.length > 0) {
    const current = stack.pop() as string;
    if (current === targetId) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of edges.get(current) ?? []) stack.push(next);
  }
  return false;
}

export function LessonFormDialog({ trigger, unitId, lesson }: LessonFormDialogProps) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  // Same-tick double submits (double click / double Enter) fire before React
  // re-renders the disabled button, so guard with a ref.
  const submittingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [prerequisiteIds, setPrerequisiteIds] = useState<string[]>([]);

  const { data: allLessons = [] } = useQuery({
    queryKey: ["admin-all-lessons"],
    queryFn: () => adminGetAllLessons(),
  });

  const otherLessons = (allLessons ?? []).filter((l) => l.unitId === unitId && l.id !== lesson?.id);
  // Hide lessons that would create a prerequisite cycle (they already depend
  // on the lesson being edited). The server enforces this too.
  const selectableLessons = lesson?.id
    ? otherLessons.filter((l) => !reachesPrerequisite(allLessons ?? [], l.id, lesson.id))
    : otherLessons;
  const hiddenCount = otherLessons.length - selectableLessons.length;

  const createMutation = useMutation({
    mutationFn: (data: {
      id?: string;
      unitId: string;
      title: string;
      description?: string;
      prerequisiteIds?: string[];
    }) => adminCreateLesson({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-lessons"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      title?: string;
      description?: string | null;
      imageUrl?: string | null;
      prerequisiteIds?: string[] | null;
    }) => adminUpdateLesson({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-lessons"] });
    },
  });

  const imageMutation = useMutation({
    mutationFn: (data: { id: string; file: string; filename: string; fileType: string }) =>
      adminUploadLessonImage({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-lessons"] });
    },
  });

  function reset() {
    setTitle("");
    setDescription("");
    setPreviewUrl("");
    setSelectedFile(null);
    setRemoveImage(false);
    setPrerequisiteIds([]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTitle(lesson?.title ?? "");
      setDescription(lesson?.description ?? "");
      setPreviewUrl(resolveImageUrl(lesson?.imageUrl) ?? "");
      setSelectedFile(null);
      setRemoveImage(false);
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
    if (submittingRef.current) return;
    if (!title.trim()) {
      toast.error("Judul Lesson wajib diisi");
      return;
    }

    submittingRef.current = true;

    try {
      let targetId: string | undefined;
      if (lesson) {
        await updateMutation.mutateAsync({
          id: lesson.id,
          title: title.trim(),
          description: description.trim() || null,
          imageUrl: removeImage ? null : undefined,
          prerequisiteIds: prerequisiteIds.length > 0 ? prerequisiteIds : null,
        });
        targetId = lesson.id;
        toast.success("Lesson berhasil diperbarui");
      } else {
        const result = await createMutation.mutateAsync({
          unitId,
          title: title.trim(),
          description: description.trim() || undefined,
          prerequisiteIds: prerequisiteIds.length > 0 ? prerequisiteIds : undefined,
        });
        targetId = result?.id;
        toast.success("Lesson berhasil ditambahkan");
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
          await trackImageUpload(
            targetId,
            imageMutation.mutateAsync({
              id: targetId,
              file: base64,
              filename: filename ?? "",
              fileType: fileType ?? "image/png",
            }),
          );
        } catch (imgErr) {
          toast.error(
            translateAdminError(imgErr, "Lesson tersimpan, tetapi gambar gagal diunggah"),
          );
        }
      }
    } catch (err) {
      toast.error(translateAdminError(err, "Gagal menyimpan lesson"));
    } finally {
      submittingRef.current = false;
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
    if (lesson?.imageUrl) setRemoveImage(true);
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
          <ImageUpload
            id="lesson-image"
            previewUrl={previewUrl}
            onFileSelect={handleImageSelect}
            onClear={handleImageClear}
            inputRef={fileRef}
          />
          {selectableLessons.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Prasyarat (opsional)</Label>
              <p className="text-xs text-muted-foreground">
                Pilih lesson yang harus diselesaikan terlebih dahulu.
                {hiddenCount > 0 &&
                  " Beberapa lesson disembunyikan karena akan menimbulkan siklus."}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectableLessons.map((l) => {
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
