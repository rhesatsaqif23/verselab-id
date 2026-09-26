// LessonVisual: lesson image with icon fallback. Renders the uploaded image
// when present (and loadable); otherwise the Lucide icon for lesson.icon.
import { useEffect, useState } from "react";
import { resolveImageUrl } from "#/libs/image.ts";
import type { Lesson } from "#/engine/types.ts";
import { getLessonIcon } from "./iconHelper.ts";

type LessonVisualProps = {
  lesson: Lesson;
  iconClassName?: string;
  imageClassName?: string;
};

export function LessonVisual({ lesson, iconClassName, imageClassName }: LessonVisualProps) {
  const src = resolveImageUrl(lesson.imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    const IconComponent = getLessonIcon(lesson.icon);
    return <IconComponent className={iconClassName} />;
  }

  return (
    <img
      src={src}
      alt={lesson.title}
      draggable={false}
      onError={() => setFailed(true)}
      className={imageClassName}
    />
  );
}
