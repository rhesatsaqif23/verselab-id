// ImageUpload: reusable drag-and-drop image picker with preview.
// Used by UnitFormDialog and LessonFormDialog. The parent owns previewUrl
// state (stored URL or object URL) and handles the actual upload on submit.
import { useRef } from "react";
import { Trash2, Upload, UploadCloud } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import { Label } from "#/components/ui/label.tsx";
import { cn } from "#/libs/utils.ts";

type ImageUploadProps = {
  id: string;
  label?: string;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export function ImageUpload({
  id,
  label = "Gambar (opsional)",
  previewUrl,
  onFileSelect,
  onClear,
  inputRef,
}: ImageUploadProps) {
  const fallbackRef = useRef<HTMLInputElement>(null);
  const fileRef = inputRef ?? fallbackRef;

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onClear();
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={fileRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFileSelect(file);
        }}
        className="hidden"
      />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) {
            onFileSelect(file);
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
                onClick={handleClear}
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
            <span className="mt-0.5 text-xs text-muted-foreground">PNG, JPG, WEBP, atau SVG</span>
          </div>
        )}
      </div>
    </div>
  );
}
