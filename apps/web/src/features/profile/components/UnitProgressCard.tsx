// UnitProgressCard: per-unit progress with unit image.
import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { Lesson } from "#/engine/types.ts";

export const FALLBACK_UNIT_IMAGE = "/course-illustration.png";

type Props = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  lessons: readonly Lesson[];
};

export default function UnitProgressCard({ title, description, imageUrl, lessons }: Props) {
  const initialSrc = imageUrl && imageUrl.trim() !== "" ? imageUrl : FALLBACK_UNIT_IMAGE;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const src = imageUrl && imageUrl.trim() !== "" ? imageUrl : FALLBACK_UNIT_IMAGE;
    setImgSrc(src);
    setHasError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_UNIT_IMAGE) {
      setImgSrc(FALLBACK_UNIT_IMAGE);
    } else {
      setHasError(true);
    }
  };

  const completedLessons = useProgressStore((s) => s.completedLessons);
  const doneCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        {!hasError ? (
          <img
            src={imgSrc}
            alt={title}
            onError={handleImageError}
            className="size-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-7" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">{title}</p>
            <span className="text-sm font-medium text-muted shrink-0 ml-2">
              {doneCount}/{lessons.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {description && <p className="text-sm text-muted truncate">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
