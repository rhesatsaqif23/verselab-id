import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { units } from "#/content/index.ts";
import { useHomeStore } from "../store.ts";
import UnitCard from "./UnitCard.tsx";

const COMMIT_THRESHOLD = 150;
const TURN_THRESHOLD = 280;
const DRAG_DIVISOR = 400;
const COMMIT_MS = 450;

function stackStyle(distance: number) {
  const abs = Math.abs(distance);
  const x = abs === 1 ? 25 : abs === 2 ? 45 : 60;
  const scale = abs === 1 ? 0.95 : abs === 2 ? 0.9 : 0.85;
  const opacity = abs === 1 ? 1 : abs === 2 ? 0.8 : 0.6;
  return {
    transform: `translateX(${x}px) scale(${scale})`,
    opacity,
    zIndex: 30 - abs,
  };
}

const CSS_TRANSITION = `all ${COMMIT_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;

export default function ShuffleCard() {
  const navigate = useNavigate();
  const selectedUnitId = useHomeStore((s) => s.selectedUnitId);
  const setSelectedUnit = useHomeStore((s) => s.setSelectedUnit);

  const [order, setOrder] = useState<string[]>(() => [
    selectedUnitId,
    ...units.filter((u) => u.id !== selectedUnitId).map((u) => u.id),
  ]);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [turning, setTurning] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragThresholdPassed = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingPointerX = useRef(0);
  const commitSourceRef = useRef<"grid" | "drag">("grid");

  useEffect(() => {
    if (commitSourceRef.current === "grid") {
      setTurning(false);
    }
    commitSourceRef.current = "grid";
    setOrder((prev) => {
      if (prev[0] === selectedUnitId) return prev;
      if (prev.includes(selectedUnitId)) {
        return [selectedUnitId, ...prev.filter((id) => id !== selectedUnitId)];
      }
      return prev;
    });
  }, [selectedUnitId]);

  useEffect(() => {
    if (!turning) return;
    const timer = setTimeout(() => {
      setTurning(false);
      startX.current = pendingPointerX.current;
    }, COMMIT_MS);
    return () => clearTimeout(timer);
  }, [turning]);

  const activeIndex = Math.max(
    0,
    units.findIndex((u) => u.id === selectedUnitId),
  );
  const prevUnit = units[(activeIndex - 1 + units.length) % units.length];
  const nextUnit = units[(activeIndex + 1) % units.length];

  const committed = Math.abs(dragX) >= COMMIT_THRESHOLD || turning;

  const commitProgress = committed
    ? Math.min(
        1,
        Math.max(0, (Math.abs(dragX) - COMMIT_THRESHOLD) / (TURN_THRESHOLD - COMMIT_THRESHOLD)),
      )
    : 0;

  const secondCardX = 25 + (0 - 25) * commitProgress;
  const secondCardScale = 0.95 + (1 - 0.95) * commitProgress;

  function stopRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function animateTo(from: number, target: number, duration: number, onDone?: () => void) {
    stopRaf();
    setAnimating(true);
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const x = from + (target - from) * eased;
      setDragX(x);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDragX(target);
        setAnimating(false);
        rafRef.current = null;
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }

  const commitNext = useCallback(() => {
    commitSourceRef.current = "drag";
    setSelectedUnit(nextUnit.id);
    setOrder((prev) =>
      prev[0] === selectedUnitId ? [nextUnit.id, ...prev.filter((id) => id !== nextUnit.id)] : prev,
    );
  }, [nextUnit.id, selectedUnitId, setSelectedUnit]);

  const commitPrev = useCallback(() => {
    commitSourceRef.current = "drag";
    setSelectedUnit(prevUnit.id);
    setOrder((prev) =>
      prev[0] === selectedUnitId ? [prevUnit.id, ...prev.filter((id) => id !== prevUnit.id)] : prev,
    );
  }, [prevUnit.id, selectedUnitId, setSelectedUnit]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // If clicking directly on a button or link inside (e.g. Mulai button), let it handle the click
    if ((e.target as HTMLElement).closest("a, button")) {
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    stopRaf();
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragThresholdPassed.current = false;
    setAnimating(false);
    setTurning(false);
    setDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      if (turning) {
        pendingPointerX.current = e.clientX;
        return;
      }

      const rawX = e.clientX - startX.current;
      const rawY = e.clientY - startY.current;

      if (!isDragThresholdPassed.current) {
        if (Math.hypot(rawX, rawY) > 6) {
          isDragThresholdPassed.current = true;
        } else {
          return;
        }
      }

      if (animating) return;

      if (rawX < -TURN_THRESHOLD) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        setDragging(false);
        setTurning(true);
        commitNext();
        setDragX(0);
        return;
      }
      if (rawX > TURN_THRESHOLD) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
        setDragging(false);
        setTurning(true);
        commitPrev();
        setDragX(0);
        return;
      }

      setDragX(rawX);
    },
    [dragging, animating, turning, commitNext, commitPrev],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragging(false);

      if (turning || animating) return;

      // If user clicked without dragging beyond threshold, navigate to the unit detail
      if (!isDragThresholdPassed.current) {
        const frontUnitId = order[0];
        if (frontUnitId) {
          navigate({ to: "/units/$unitId", params: { unitId: frontUnitId } });
        }
        return;
      }

      if (dragX < -COMMIT_THRESHOLD) {
        const releaseX = dragX;
        animateTo(releaseX, -TURN_THRESHOLD, 200, () => {
          setTurning(true);
          commitNext();
          setDragX(0);
        });
      } else if (dragX > COMMIT_THRESHOLD) {
        const releaseX = dragX;
        animateTo(releaseX, TURN_THRESHOLD, 200, () => {
          setTurning(true);
          commitPrev();
          setDragX(0);
        });
      } else {
        animateTo(dragX, 0, 300);
      }
    },
    [dragging, turning, animating, dragX, order, navigate, commitNext, commitPrev],
  );

  const progress = Math.min(1, Math.abs(dragX) / DRAG_DIVISOR);

  const frontTransition = turning || (!dragging && !animating) ? CSS_TRANSITION : "none";

  return (
    <div className="grid overflow-hidden px-6 pt-2 pb-8">
      {order.map((unitId, i) => {
        const unit = units.find((u) => u.id === unitId);
        if (!unit) return null;
        const distance = i;
        const isFront = distance === 0;

        if (isFront) {
          return (
            <div
              key={unit.id}
              aria-hidden={false}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                position: "relative",
                gridRow: 1,
                gridColumn: 1,
                transform: `translateX(${dragX * 0.75}px) scale(${1 - progress * 0.5})`,
                opacity: 1,
                zIndex: 30,
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
                userSelect: "none",
                transition: frontTransition,
              }}
            >
              <UnitCard unit={unit} />
            </div>
          );
        }

        const isSecond = distance === 1;

        return (
          <div
            key={unit.id}
            aria-hidden
            style={{
              position: "relative",
              gridRow: 1,
              gridColumn: 1,
              transform: isSecond
                ? `translateX(${secondCardX}px) scale(${secondCardScale})`
                : stackStyle(distance).transform,
              opacity: isSecond ? 1 : stackStyle(distance).opacity,
              zIndex: committed && isSecond && !turning ? 31 : stackStyle(distance).zIndex,
              pointerEvents: "none",
              transition: isSecond && turning ? "none" : CSS_TRANSITION,
            }}
          >
            <UnitCard unit={unit} />
          </div>
        );
      })}
    </div>
  );
}
