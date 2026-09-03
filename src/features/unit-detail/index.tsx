// UnitDetailPage: Interactive full-screen whiteboard lesson map with free-drag canvas and unit sidebar.
import { useState } from "react";
import type { Unit } from "#/engine/types.ts";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { LessonStatus } from "./types.ts";
import UnitSidebar from "./components/UnitSidebar.tsx";
import WhiteboardMapCanvas from "./components/WhiteboardMapCanvas.tsx";
import UnitMapBottomBar from "./components/UnitMapBottomBar.tsx";

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
        />
      </div>
    </div>
  );
}
