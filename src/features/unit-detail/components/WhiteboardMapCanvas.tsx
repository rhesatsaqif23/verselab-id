// WhiteboardMapCanvas: presentation-only whiteboard viewport.
// All pan/zoom logic lives in useCanvasPan; layout math lives in lessonLayout.
import { useCallback, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import type { Unit } from "#/engine/types.ts";
import type { LessonStatus } from "../types.ts";
import { useCanvasPan } from "../hooks/useCanvasPan.ts";
import { buildNodes, buildConnections, CARD_WIDTH, CARD_HEIGHT } from "../lessonLayout.ts";
import LessonMapCard from "./LessonMapCard.tsx";
import CanvasConnectingArrows from "./CanvasConnectingArrows.tsx";
import { Button } from "#/components/ui/button";

type WhiteboardMapCanvasProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
};

export default function WhiteboardMapCanvas({
  unit,
  completedLessons,
  selectedLessonId,
  onSelectLesson,
}: WhiteboardMapCanvasProps) {
  const {
    containerRef,
    canvasRef,
    pan,
    scale,
    isPanning,
    hasMovedRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    recenter,
  } = useCanvasPan();

  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  const nodes = buildNodes(unit.lessons.map((l) => l.id));
  const connections = buildConnections(nodes, completedLessons);

  // Compute the pan offset that centres the active lesson card in the viewport
  const computeCenteredPan = useCallback(() => {
    const activeIdx = unit.lessons.findIndex((l) => l.id === currentLesson?.id);
    const targetIdx = activeIdx >= 0 ? activeIdx : 0;
    const node = nodes[targetIdx];
    const el = containerRef.current;

    if (node && el) {
      return {
        x: el.clientWidth / 2 - node.x - CARD_WIDTH / 2,
        y: el.clientHeight / 2 - node.y - CARD_HEIGHT / 2,
      };
    }
    return { x: 80, y: 120 };
  }, [currentLesson?.id, nodes, unit.lessons, containerRef]);

  // Centre on mount — defer one frame so containerRef has real dimensions
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      recenter(computeCenteredPan());
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative h-full w-full flex-1 overflow-hidden select-none bg-background ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(21,145,220,0.06)_0%,transparent_70%)]" />

      {/* Dot-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top-left: map hint banner */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-2 rounded-2xl border border-border/80 bg-card/85 px-4 py-2 shadow-xs backdrop-blur-xs">
        <Move className="size-4 text-primary" />
        <span className="text-xs sm:text-sm font-bold text-foreground">
          Peta Belajar &bull; {unit.title}
        </span>
        <span className="text-xs text-muted-foreground ml-1">(Geser bebas untuk menjelajah)</span>
      </div>

      {/* Top-right: zoom + recenter toolbar */}
      <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
        <div className="flex items-center rounded-2xl border border-border bg-card/90 p-1 shadow-md backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={zoomIn}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={zoomOut}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => recenter(computeCenteredPan())}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Pusatkan Peta (Recenter)"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Pannable & zoomable canvas content */}
      <div
        ref={canvasRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        <CanvasConnectingArrows connections={connections} />

        {unit.lessons.map((lesson, idx) => {
          const node = nodes[idx];
          if (!node) return null;

          return (
            <div
              key={lesson.id}
              className="absolute"
              style={{ left: `${node.x}px`, top: `${node.y}px`, width: `${CARD_WIDTH}px` }}
            >
              <LessonMapCard
                lesson={lesson}
                index={idx}
                status={getStatus(lesson.id)}
                isSelected={selectedLessonId === lesson.id}
                onSelect={() => {
                  if (!hasMovedRef.current) onSelectLesson(lesson.id);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
