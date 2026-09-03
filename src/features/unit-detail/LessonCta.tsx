// LessonCta: sticky bottom card showing the active lesson and start/continue button.
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import type { Lesson } from "#/engine/types.ts";

type LessonCtaProps = {
  activeLesson: Lesson;
  hasStarted: boolean;
};

export default function LessonCta({ activeLesson, hasStarted }: LessonCtaProps) {
  return (
    <div className="sticky bottom-0 pt-4 pb-2">
      <Card className="border-2 border-border shadow-xl">
        <CardContent className="flex flex-col gap-3 p-5">
          <p className="text-center text-base font-bold text-foreground">{activeLesson.title}</p>
          <Button asChild size="lg" className="w-full">
            <Link to="/lesson/$lessonId" params={{ lessonId: activeLesson.id }}>
              <PlayCircle className="mr-2 size-5" />
              {hasStarted ? "Lanjutkan" : "Mulai"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
