// UnitDetailPage: Interactive full-screen whiteboard lesson map with free-drag canvas and unit sidebar.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { LessonStatus } from "../types.ts";
import UnitSidebar from "../components/UnitSidebar.tsx";
import WhiteboardMapCanvas from "../components/WhiteboardMapCanvas.tsx";
import UnitMapBottomBar from "../components/UnitMapBottomBar.tsx";

type Props = { unit: Unit };

export default function UnitDetailPage({ unit }: Props) {
  const completedLessons = useProgressStore((s) => s.completedLessons);

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active / Selected lesson selection
  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    currentLesson?.id ?? null,
  );

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  const selectedLesson = selectedLessonId
    ? (unit.lessons.find((l) => l.id === selectedLessonId) ?? currentLesson)
    : currentLesson;

  const selectedStatus = selectedLesson ? getStatus(selectedLesson.id) : "current";

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  // Empty state: unit has no lessons yet — show the sidebar with a centered
  // message instead of an empty canvas and bottom bar.
  if (unit.lessons.length === 0) {
    return (
      <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
        <UnitSidebar
          unit={unit}
          completedLessons={completedLessons}
          selectedLessonId={null}
          onSelectLesson={handleSelectLesson}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className="relative flex h-full flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <BookOpen className="size-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Belum ada topik</h2>
            <p className="max-w-sm text-sm sm:text-base text-muted-foreground">
              Materi {unit.title} sedang disiapkan. Kembali lagi nanti untuk mulai belajar.
            </p>
          </div>
          <Button asChild size="lg" className="mt-2 font-bold">
            <Link to="/material">Lihat materi lain</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Left Collapsible Sidebar */}
      <UnitSidebar
        unit={unit}
        completedLessons={completedLessons}
        selectedLessonId={selectedLessonId}
        onSelectLesson={handleSelectLesson}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Free-Drag Whiteboard Canvas */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <WhiteboardMapCanvas
          unit={unit}
          completedLessons={completedLessons}
          selectedLessonId={selectedLessonId}
          onSelectLesson={handleSelectLesson}
        />

        {/* Floating Bottom Bar with Progress and Mulai CTA */}
        <UnitMapBottomBar
          unit={unit}
          completedLessons={completedLessons}
          selectedLesson={selectedLesson}
          status={selectedStatus}
          allLessons={[...unit.lessons]}
        />
      </div>
    </div>
  );
}
