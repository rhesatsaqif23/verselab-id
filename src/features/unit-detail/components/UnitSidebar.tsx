// UnitSidebar: Left sidebar displaying current unit metadata, search/filter, and topic breakdown.
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { Unit } from "#/engine/types.ts";
import { Button } from "#/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");

  const completedCount = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  const totalCount = unit.lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredLessons = unit.lessons.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`relative z-20 flex h-full flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
          isOpen ? "w-80 md:w-88" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-full w-80 md:w-88 flex-col p-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Kategori
              </span>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Detail Unit Belajar
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggle}
              className="rounded-xl text-muted-foreground hover:text-foreground"
              aria-label="Tutup sidebar"
            >
              <ChevronLeft className="size-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik atau materi..."
              className="w-full rounded-2xl border border-border bg-background py-2.5 pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Unit Overview Card */}
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {unit.imageUrl ? (
                <img
                  src={unit.imageUrl}
                  alt={unit.title}
                  className="size-12 object-contain shrink-0"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 font-black text-primary">
                  {unit.title.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-foreground">{unit.title}</h3>
                <span className="text-xs font-semibold text-primary">
                  {completedCount}/{totalCount} Topik Selesai
                </span>
              </div>
            </div>

            {unit.description && (
              <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {unit.description}
              </p>
            )}

            {/* Overall Unit Progress Bar */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
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

          {/* Topic list scrollable inside sidebar */}
          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Topik ({filteredLessons.length})
            </span>
            <div className="mt-2.5 flex flex-col gap-2">
              {filteredLessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isSelected = selectedLessonId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/20"
                        : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs sm:text-sm font-semibold text-foreground">
                        {lesson.title}
                      </span>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    ) : (
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {lesson.screens.length} soal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Toggle Button when Sidebar is closed */}
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
