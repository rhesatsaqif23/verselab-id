// useDragReorder: pointer-based drag-to-reorder for a vertical list with a
// grip handle. Reports live moves through onReorder while dragging so the
// parent can reorder optimistically; the parent persists through onDrop.
// Touch-safe via pointer capture on the handle.
import { useCallback, useRef, useState } from "react";

type UseDragReorderOptions = {
  /** Current order of row ids. */
  ids: string[];
  /** Blocks new drags while a persist request is in flight. */
  disabled?: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDrop: () => void;
};

export type DragReorderRowProps = {
  ref: (el: HTMLDivElement | null) => void;
  onClickCapture: (e: React.SyntheticEvent) => void;
};

export type DragReorderHandleProps = {
  "aria-label": string;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export type UseDragReorderReturn = {
  /** Id of the row being dragged, for drop-target styling. Null when idle. */
  draggingId: string | null;
  getRowProps: (id: string) => DragReorderRowProps;
  getHandleProps: (id: string, index: number) => DragReorderHandleProps;
};

// Pointer travel below this threshold still counts as a click, not a drag.
const DRAG_THRESHOLD = 6;

function capturePointer(e: React.PointerEvent) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // jsdom and older browsers may not implement pointer capture.
  }
}

export function useDragReorder({
  ids,
  disabled = false,
  onReorder,
  onDrop,
}: UseDragReorderOptions): UseDragReorderReturn {
  const rowEls = useRef(new Map<string, HTMLDivElement>());
  const drag = useRef<{ id: string; startY: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const registerRow = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) rowEls.current.set(id, el);
      else rowEls.current.delete(id);
    },
    [],
  );

  // A drag ending over a row must not trigger that row's click action.
  const suppressPostDragClick = useCallback((e: React.SyntheticEvent) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  /** Row index currently under the pointer, by vertical midpoints. */
  const indexAtY = useCallback(
    (clientY: number) => {
      let target = ids.length - 1;
      for (let i = 0; i < ids.length; i++) {
        const rect = rowEls.current.get(ids[i])?.getBoundingClientRect();
        if (!rect) continue;
        if (clientY < rect.top + rect.height / 2) {
          target = i;
          break;
        }
      }
      return target;
    },
    [ids],
  );

  const handlePointerDown = useCallback(
    (id: string) => (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      // The handle sets touch-action: none, so touch drags never fight the
      // list scroll and are safe to treat exactly like mouse drags.
      drag.current = { id, startY: e.clientY, moved: false };
      capturePointer(e);
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const active = drag.current;
      if (!active) return;
      if (Math.abs(e.clientY - active.startY) <= DRAG_THRESHOLD) return;
      active.moved = true;
      setDraggingId(active.id);
      const fromIndex = ids.indexOf(active.id);
      if (fromIndex === -1) return;
      const target = indexAtY(e.clientY);
      if (target !== fromIndex) onReorder(fromIndex, target);
    },
    [ids, indexAtY, onReorder],
  );

  const endDrag = useCallback(() => {
    const wasDrag = drag.current?.moved ?? false;
    drag.current = null;
    setDraggingId(null);
    if (wasDrag) {
      suppressClick.current = true;
      onDrop();
    }
  }, [onDrop]);

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault();
        onReorder(index, index - 1);
        onDrop();
      } else if (e.key === "ArrowDown" && index < ids.length - 1) {
        e.preventDefault();
        onReorder(index, index + 1);
        onDrop();
      } else if (e.key === "Home" && index > 0) {
        e.preventDefault();
        onReorder(index, 0);
        onDrop();
      } else if (e.key === "End" && index < ids.length - 1) {
        e.preventDefault();
        onReorder(index, ids.length - 1);
        onDrop();
      }
    },
    [disabled, ids.length, onDrop, onReorder],
  );

  const getRowProps = useCallback(
    (id: string): DragReorderRowProps => ({
      ref: registerRow(id),
      onClickCapture: suppressPostDragClick,
    }),
    [registerRow, suppressPostDragClick],
  );

  const getHandleProps = useCallback(
    (id: string, index: number): DragReorderHandleProps => ({
      "aria-label": "Seret untuk menyusun ulang",
      onPointerDown: handlePointerDown(id),
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown: handleKeyDown(index),
    }),
    [endDrag, handleKeyDown, handlePointerDown, handlePointerMove],
  );

  return { draggingId, getRowProps, getHandleProps };
}
