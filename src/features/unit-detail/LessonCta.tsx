import { Link } from "@tanstack/react-router";
import { Lock, PlayCircle, RotateCcw } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import type { Lesson } from "#/engine/types.ts";
import type { LessonStatus } from "./types.ts";

type LessonCtaProps = {
  lesson: Lesson;
  status: LessonStatus;
  isVisible: boolean;
};

export default function LessonCta({ lesson, status, isVisible }: LessonCtaProps) {
  return (
    <div
      className={`w-full transition-all duration-300 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <Card className="border-2 border-border shadow-2xl bg-card rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 text-center sm:text-left">
          <p className="text-base font-bold text-foreground sm:text-lg truncate max-w-sm">
            {lesson.title}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {status === "previous" && (
              <Button asChild size="lg" className="w-full sm:w-auto !text-base !font-bold">
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
                  <RotateCcw className="mr-2 size-5" />
                  Main Lagi
                </Link>
              </Button>
            )}

            {status === "current" && (
              <Button asChild size="lg" className="w-full sm:w-auto !text-base !font-bold">
                <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
                  <PlayCircle className="mr-2 size-5" />
                  Mulai
                </Link>
              </Button>
            )}

            {status === "unlocked" && (
              <Button disabled size="lg" variant="secondary" className="w-full sm:w-auto !text-base !font-bold opacity-70">
                <Lock className="mr-2 size-5" />
                Terkunci
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
