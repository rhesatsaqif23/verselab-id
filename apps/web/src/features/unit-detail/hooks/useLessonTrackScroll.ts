// useLessonTrackScroll: encapsulates mouse drag-to-scroll, click suppression,
// and custom scrollbar state for the materi lesson track. The component using
// it stays presentational; all pointer math and scroll measurements live here.
import { useCallback, useEffect, useRef, useState } from "react";

export type UseLessonTrackScrollReturn = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  barRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  canScroll: boolean;
  progress: number;
  thumbWidthPct: number;
  thumbLeftPct: number;
  handleTrackPointerDown: (e: React.PointerEvent) => void;
  handleTrackPointerMove: (e: React.PointerEvent) => void;
  handleTrackPointerUp: () => void;
  handleTrackClickCapture: (e: React.SyntheticEvent) => void;
  handleBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleBarKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleThumbPointerDown: (e: React.PointerEvent) => void;
  handleThumbPointerMove: (e: React.PointerEvent) => void;
  handleThumbPointerUp: () => void;
};

// Mouse movement below this threshold still counts as a click, not a drag.
const DRAG_THRESHOLD = 8;

function capturePointer(e: React.PointerEvent) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // jsdom and older browsers may not implement pointer capture.
  }
}

export function useLessonTrackScroll(lessonCount: number): UseLessonTrackScrollReturn {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const thumbDrag = useRef<{ startX: number; startScrollLeft: number } | null>(null);
  const suppressClick = useRef(false);
  const suppressBarClick = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollState, setScrollState] = useState({
    canScroll: false,
    progress: 0,
    thumbRatio: 1,
  });

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollState({
      canScroll: max > 0,
      progress: max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0,
      thumbRatio: el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateScrollState);
      observer.observe(el);
      return () => {
        el.removeEventListener("scroll", updateScrollState);
        observer.disconnect();
      };
    }
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState, lessonCount]);

  // Mouse drag-to-scroll on the track; touch keeps its native scroll behavior.
  const handleTrackPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { startX: e.clientX, startScrollLeft: el.scrollLeft };
    capturePointer(e);
  }, []);

  const handleTrackPointerMove = useCallback((e: React.PointerEvent) => {
    const active = drag.current;
    const el = trackRef.current;
    if (!active || !el) return;
    const dx = e.clientX - active.startX;
    if (Math.abs(dx) <= DRAG_THRESHOLD) return;
    setIsDragging(true);
    suppressClick.current = true;
    el.scrollLeft = active.startScrollLeft - dx;
  }, []);

  const handleTrackPointerUp = useCallback(() => {
    drag.current = null;
    setIsDragging(false);
  }, []);

  // A drag ending over a lesson must not select it.
  const handleTrackClickCapture = useCallback((e: React.SyntheticEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const scrollToRatio = useCallback((ratio: number) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    el.scrollLeft = Math.min(1, Math.max(0, ratio)) * max;
  }, []);

  // Clicking the bar jumps the track; clicks from the thumb are ignored.
  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (suppressBarClick.current || e.target !== e.currentTarget) {
        suppressBarClick.current = false;
        return;
      }
      const bar = barRef.current;
      if (!bar || bar.clientWidth === 0) return;
      const rect = bar.getBoundingClientRect();
      scrollToRatio((e.clientX - rect.left) / bar.clientWidth);
    },
    [scrollToRatio],
  );

  const handleThumbPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (!trackRef.current) return;
    e.stopPropagation();
    thumbDrag.current = { startX: e.clientX, startScrollLeft: trackRef.current.scrollLeft };
    setIsDragging(true);
    capturePointer(e);
  }, []);

  const handleThumbPointerMove = useCallback((e: React.PointerEvent) => {
    const active = thumbDrag.current;
    const el = trackRef.current;
    const bar = barRef.current;
    if (!active || !el || !bar || bar.clientWidth === 0) return;
    const ratio = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    if (ratio >= 1) return;
    // The thumb travels (1 - ratio) of the bar width across the full scroll range.
    if (thumbDrag.current) suppressBarClick.current = true;
    const dx = e.clientX - active.startX;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = active.startScrollLeft + (dx / bar.clientWidth / (1 - ratio)) * max;
  }, []);

  const handleThumbPointerUp = useCallback(() => {
    thumbDrag.current = null;
    setIsDragging(false);
  }, []);

  const handleBarKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.scrollLeft -= max * 0.1;
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      el.scrollLeft += max * 0.1;
    } else if (e.key === "Home") {
      e.preventDefault();
      el.scrollLeft = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      el.scrollLeft = max;
    }
  }, []);

  const { canScroll, progress, thumbRatio } = scrollState;

  return {
    trackRef,
    barRef,
    isDragging,
    canScroll,
    progress,
    thumbWidthPct: thumbRatio * 100,
    thumbLeftPct: progress * (100 - thumbRatio * 100),
    handleTrackPointerDown,
    handleTrackPointerMove,
    handleTrackPointerUp,
    handleTrackClickCapture,
    handleBarClick,
    handleBarKeyDown,
    handleThumbPointerDown,
    handleThumbPointerMove,
    handleThumbPointerUp,
  };
}
