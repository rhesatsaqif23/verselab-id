// WhiteboardMapCanvas: free drag/pan whiteboard viewport with lesson cards and connecting arrows.
import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import type { Unit } from "#/engine/types.ts";
import type { LessonStatus, LessonNodePosition, ConnectionLine } from "../types.ts";
import LessonMapCard from "./LessonMapCard.tsx";
import CanvasConnectingArrows from "./CanvasConnectingArrows.tsx";
import { Button } from "#/components/ui/button";

type WhiteboardMapCanvasProps = {
  unit: Unit;
  completedLessons: string[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
};

// Card dimensions & spacing constants for layout calculation
const CARD_WIDTH = 340;
const CARD_HEIGHT = 180;
const HORIZONTAL_GAP = 90;
const VERTICAL_STEP = 110;

export default function WhiteboardMapCanvas({
  unit,
  completedLessons,
  selectedLessonId,
  onSelectLesson,
}: WhiteboardMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan coordinates and zoom scale
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 120 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState(false);

  const startPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const currentLesson =
    unit.lessons.find((l) => !completedLessons.includes(l.id)) ?? unit.lessons[0];

  function getStatus(lessonId: string): LessonStatus {
    if (completedLessons.includes(lessonId)) return "previous";
    if (currentLesson?.id === lessonId) return "current";
    return "unlocked";
  }

  // Generate zig-zag positions for each lesson node
  // Alternates row offset to create the game-like zig zag path
  const nodes: LessonNodePosition[] = unit.lessons.map((lesson, idx) => {
    // 3 cards per serpentine row or horizontal wave
    const col = idx;
    // wave vertical offset pattern: [0, 1, 0, 1]
    const rowOffset = (idx % 2) * VERTICAL_STEP;

    const x = col * (CARD_WIDTH + HORIZONTAL_GAP);
    const y = rowOffset;

    return {
      id: lesson.id,
      x,
      y,
      col: idx,
      row: idx % 2,
    };
  });

  // Calculate connection lines between sequential nodes
  const connections: ConnectionLine[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const fromNode = nodes[i];
    const toNode = nodes[i + 1];
    if (fromNode && toNode) {
      connections.push({
        fromId: fromNode.id,
        toId: toNode.id,
        fromX: fromNode.x + CARD_WIDTH,
        fromY: fromNode.y + CARD_HEIGHT / 2,
        toX: toNode.x,
        toY: toNode.y + CARD_HEIGHT / 2,
        isCompleted: completedLessons.includes(fromNode.id),
      });
    }
  }

  // Pointer event handlers for free panning across all directions
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't pan on secondary buttons
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsPanning(true);
    hasMovedRef.current = false;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - startPointer.current.x;
    const dy = e.clientY - startPointer.current.y;

    if (Math.hypot(dx, dy) > 4) {
      hasMovedRef.current = true;
    }

    setPan({
      x: startPan.current.x + dx,
      y: startPan.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsPanning(false);
  };

  // Recenter canvas on active/current lesson
  const recenter = useCallback(() => {
    const activeIdx = unit.lessons.findIndex((l) => l.id === currentLesson?.id);
    const targetIdx = activeIdx >= 0 ? activeIdx : 0;
    const node = nodes[targetIdx];

    if (node && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setPan({
        x: containerWidth / 2 - node.x - CARD_WIDTH / 2,
        y: containerHeight / 2 - node.y - CARD_HEIGHT / 2,
      });
      setScale(1);
    } else {
      setPan({ x: 80, y: 120 });
      setScale(1);
    }
  }, [currentLesson?.id, nodes, unit.lessons]);

  // Initial center on mount
  useEffect(() => {
    recenter();
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
      {/* Background canvas subtle watermark pattern & grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(21,145,220,0.06)_0%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Right Canvas Tools (Recenter, Zoom) */}
      <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
        <div className="flex items-center rounded-2xl border border-border bg-card/90 p-1 shadow-md backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={recenter}
            className="rounded-xl text-muted-foreground hover:text-foreground"
            title="Pusatkan Peta (Recenter)"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Top Banner indicating Unit Title */}
      <div className="pointer-events-none absolute left-6 top-5 z-10 flex items-center gap-2 rounded-2xl border border-border/80 bg-card/85 px-4 py-2 shadow-xs backdrop-blur-xs">
        <Move className="size-4 text-primary" />
        <span className="text-xs sm:text-sm font-bold text-foreground">
          Peta Belajar &bull; {unit.title}
        </span>
        <span className="text-[11px] text-muted-foreground ml-1">
          (Geser bebas untuk menjelajah)
        </span>
      </div>

      {/* Pannable & Zoomable Canvas Content Container */}
      <div
        className="absolute left-0 top-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Render Connecting Arrows Underneath Cards */}
        <CanvasConnectingArrows connections={connections} />

        {/* Render Lesson Nodes */}
        {unit.lessons.map((lesson, idx) => {
          const node = nodes[idx];
          if (!node) return null;
          const status = getStatus(lesson.id);
          const isSelected = selectedLessonId === lesson.id;

          return (
            <div
              key={lesson.id}
              className="absolute"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${CARD_WIDTH}px`,
              }}
            >
              <LessonMapCard
                lesson={lesson}
                index={idx}
                status={status}
                isSelected={isSelected}
                onSelect={() => {
                  // Only select if not dragging actively
                  if (!hasMovedRef.current) {
                    onSelectLesson(lesson.id);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
