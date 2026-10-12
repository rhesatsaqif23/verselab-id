// useCanvasPan: encapsulates pan, zoom, and pointer capture state for the whiteboard canvas.
import { useState, useRef, useCallback } from "react";

type Point = { x: number; y: number };

type UseCanvasPanOptions = {
  /** px offset to fall back to when no target node is found */
  fallbackPan?: Point;
};

export type UseCanvasPanReturn = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  pan: Point;
  scale: number;
  isPanning: boolean;
  hasMovedRef: React.RefObject<boolean>;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: (targetPan: Point) => void;
  animatedPanTo: (targetPan: Point, durationMs?: number) => void;
};

const DRAG_THRESHOLD_PX = 4;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.4;
const SCALE_STEP = 0.1;

export function useCanvasPan({
  fallbackPan = { x: 40, y: 160 },
}: UseCanvasPanOptions = {}): UseCanvasPanReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState<Point>(fallbackPan);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const startPointer = useRef<Point>({ x: 0, y: 0 });
  const startPan = useRef<Point>({ x: 0, y: 0 });
  const currentPanRef = useRef<Point>(fallbackPan);
  const currentScaleRef = useRef(1);
  const hasMovedRef = useRef(false);
  const hasCapturedRef = useRef(false);
  const animationRafRef = useRef<number | null>(null);

  const applyTransform = useCallback((p: Point, s: number) => {
    const el = canvasRef.current;
    if (el) {
      el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${s})`;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    hasMovedRef.current = false;
    hasCapturedRef.current = false;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...currentPanRef.current };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - startPointer.current.x;
      const dy = e.clientY - startPointer.current.y;

      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
        hasMovedRef.current = true;

        if (!hasCapturedRef.current) {
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            hasCapturedRef.current = true;
          } catch {}
        }
      }

      if (hasMovedRef.current) {
        const newPan = {
          x: startPan.current.x + dx,
          y: startPan.current.y + dy,
        };
        currentPanRef.current = newPan;
        applyTransform(newPan, currentScaleRef.current);
      }
    },
    [isPanning, applyTransform],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      if (hasCapturedRef.current) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        hasCapturedRef.current = false;
      }
      setIsPanning(false);
      setPan({ ...currentPanRef.current });
    },
    [isPanning],
  );

  const zoomIn = useCallback(() => {
    currentScaleRef.current = Math.min(MAX_SCALE, currentScaleRef.current + SCALE_STEP);
    setScale(currentScaleRef.current);
    applyTransform(currentPanRef.current, currentScaleRef.current);
  }, [applyTransform]);

  const zoomOut = useCallback(() => {
    currentScaleRef.current = Math.max(MIN_SCALE, currentScaleRef.current - SCALE_STEP);
    setScale(currentScaleRef.current);
    applyTransform(currentPanRef.current, currentScaleRef.current);
  }, [applyTransform]);

  const recenter = useCallback(
    (targetPan: Point) => {
      if (animationRafRef.current !== null) {
        cancelAnimationFrame(animationRafRef.current);
        animationRafRef.current = null;
      }
      currentPanRef.current = targetPan;
      currentScaleRef.current = 1;
      setPan(targetPan);
      setScale(1);
      applyTransform(targetPan, 1);
    },
    [applyTransform],
  );

  // Smoothly animate the canvas to targetPan with an ease-out-cubic curve.
  const animatedPanTo = useCallback(
    (targetPan: Point, durationMs = 350) => {
      // Cancel any in-flight animation
      if (animationRafRef.current !== null) {
        cancelAnimationFrame(animationRafRef.current);
        animationRafRef.current = null;
      }

      const fromPan = { ...currentPanRef.current };
      const fromScale = currentScaleRef.current;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const raw = Math.min(elapsed / durationMs, 1);
        // ease-out cubic: t^3 deceleration
        const t = 1 - (1 - raw) * (1 - raw) * (1 - raw);

        const nextPan = {
          x: fromPan.x + (targetPan.x - fromPan.x) * t,
          y: fromPan.y + (targetPan.y - fromPan.y) * t,
        };
        // Animate scale back to 1 if zoomed
        const nextScale = fromScale + (1 - fromScale) * t;

        currentPanRef.current = nextPan;
        currentScaleRef.current = nextScale;
        applyTransform(nextPan, nextScale);

        if (raw < 1) {
          animationRafRef.current = requestAnimationFrame(tick);
        } else {
          animationRafRef.current = null;
          setPan(targetPan);
          setScale(1);
        }
      };

      animationRafRef.current = requestAnimationFrame(tick);
    },
    [applyTransform],
  );

  return {
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
    animatedPanTo,
  };
}
