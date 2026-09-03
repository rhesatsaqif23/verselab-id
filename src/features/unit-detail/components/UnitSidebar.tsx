// UnitSidebar: presentation component for the left unit-detail sidebar.
// Search/filter/progress logic lives in useUnitSidebar.
import { Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { Unit } from "#/engine/types.ts";
import { Button } from "#/components/ui/button";
import { useUnitSidebar } from "../hooks/useUnitSidebar.ts";
import { getLessonIcon } from "../iconHelper.ts";

type UnitSidebarProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export default function UnitSidebar({
  unit,
  completedLessons,
  selectedLessonId,
  onSelectLesson,
  isOpen,
  onToggle,
}: UnitSidebarProps) {
  const {
    searchQuery,
    setSearchQuery,
    completedCount,
    totalCount,
    progressPercent,
    filteredLessons,
  } = useUnitSidebar(unit, completedLessons);

  return (
    <>
      {/* Sidebar container */}
      <aside
        className={`relative z-20 flex h-full flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
          isOpen ? "w-80 md:w-88" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-full w-80 md:w-88 flex-col p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Detail Unit Belajar
            </h2>
            <Button
              variant="shadowless"
              size="icon-sm"
              onClick={onToggle}
              className="rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Tutup sidebar"
            >
              <ChevronLeft className="size-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau materi..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Unit overview card — font sizes bumped one level */}
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {unit.imageUrl ? (
                <img
                  src={unit.imageUrl}
                  alt={unit.title}
                  className="size-14 shrink-0 object-contain"
                />
              ) : (
                <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-lg font-black text-primary">
                  {unit.title.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-foreground">{unit.title}</h3>
                <span className="text-sm font-semibold text-primary">
                  {completedCount}/{totalCount} Topik Selesai
                </span>
              </div>
            </div>

            {unit.description && (
              <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {unit.description}
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                <span>Progress Unit</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Topic list */}
          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <span className="text-sm font-black tracking-wide">
              Daftar Topik ({filteredLessons.length})
            </span>
            <div className="mt-2.5 flex flex-col gap-2">
              {filteredLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isSelected = selectedLessonId === lesson.id;

                // Mirror the icon-box status colors used in LessonMapCard
                const currentLesson = unit.lessons.find((l) => !completedLessons.includes(l.id));
                const isCurrent = currentLesson?.id === lesson.id;
                const IconComponent = getLessonIcon(lesson.icon);

                const iconBoxClass = isCompleted
                  ? "border-success/30 bg-success/10 text-success"
                  : isCurrent
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/10 text-muted-foreground";

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {/* Icon box matching LessonMapCard style */}
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${iconBoxClass}`}
                    >
                      <IconComponent className="size-4 stroke-2" />
                    </div>

                    {/* Title + screen count */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs sm:text-sm font-semibold text-foreground">
                        {lesson.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lesson.screens.length} soal
                      </span>
                    </div>

                    {/* Completion badge */}
                    {isCompleted && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-4 top-4 z-30 flex size-10 items-center justify-center rounded-2xl border border-border bg-card shadow-md transition-all hover:bg-accent hover:text-accent-foreground"
          aria-label="Buka sidebar info unit"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </>
  );
}
