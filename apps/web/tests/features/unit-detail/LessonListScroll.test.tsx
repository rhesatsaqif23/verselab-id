// LessonList track: mouse drag-to-scroll with click suppression, plus a
// custom scrollbar that stays visible whenever the track overflows.
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LessonList from "#/features/unit-detail/components/LessonList.tsx";
import type { Unit } from "#/engine/types.ts";

function makeUnit(count: number): Unit {
  return {
    id: "u-1",
    slug: "u-1",
    title: "Unit 1",
    lessons: Array.from({ length: count }, (_, i) => ({
      id: `l-${i}`,
      title: `Lesson ${i}`,
      screens: [],
    })),
  };
}

function mockScrollMetrics(
  el: HTMLElement,
  metrics: { scrollWidth: number; clientWidth: number; scrollLeft?: number },
) {
  let left = metrics.scrollLeft ?? 0;
  Object.defineProperties(el, {
    scrollWidth: { configurable: true, get: () => metrics.scrollWidth },
    clientWidth: { configurable: true, get: () => metrics.clientWidth },
    scrollLeft: {
      configurable: true,
      get: () => left,
      set: (value: number) => {
        left = value;
      },
    },
  });
}

function renderList(onSelectLesson: (id: string) => void = vi.fn()) {
  const result = render(
    <LessonList
      unit={makeUnit(8)}
      completedLessons={[]}
      selectedLessonId={null}
      onSelectLesson={onSelectLesson}
    />,
  );
  const track = screen.getByTestId("lesson-track");
  return { ...result, track };
}

function rowButton(title: string): HTMLElement {
  const button = screen.getByText(title).closest('[role="button"]');
  if (!button || !(button instanceof HTMLElement)) throw new Error(`row ${title} not found`);
  return button;
}

/** Makes the track overflow, then notifies React via a scroll event. */
function makeScrollable(track: HTMLElement) {
  mockScrollMetrics(track, { scrollWidth: 1000, clientWidth: 400 });
  fireEvent.scroll(track);
  const bar = screen.getByTestId("lesson-scrollbar");
  const thumb = screen.getByTestId("lesson-scrollbar-thumb");
  Object.defineProperty(bar, "clientWidth", { configurable: true, get: () => 400 });
  bar.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 400, bottom: 12, width: 400, height: 12 }) as DOMRect;
  return { bar, thumb };
}

describe("LessonList custom scrollbar", () => {
  it("stays hidden when the track does not overflow", () => {
    renderList();
    expect(screen.queryByTestId("lesson-scrollbar")).toBeNull();
  });

  it("stays visible with a proportional thumb once the track overflows", () => {
    const { track } = renderList();
    const { bar, thumb } = makeScrollable(track);

    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("role", "scrollbar");
    // 400px visible out of 1000px of content.
    expect((thumb as HTMLElement).style.width).toBe("40%");
    expect((thumb as HTMLElement).style.left).toBe("0%");
  });

  it("moves the thumb as the track scrolls", () => {
    const { track } = renderList();
    makeScrollable(track);

    (track as HTMLElement & { scrollLeft: number }).scrollLeft = 300;
    fireEvent.scroll(track);

    const thumb = screen.getByTestId("lesson-scrollbar-thumb");
    // Halfway through: 0.5 * (100 - 40) = 30%.
    expect((thumb as HTMLElement).style.left).toBe("30%");
    expect(screen.getByTestId("lesson-scrollbar")).toHaveAttribute("aria-valuenow", "50");
  });

  it("jumps the track when the bar is clicked", () => {
    const { track } = renderList();
    const { bar } = makeScrollable(track);

    fireEvent.click(bar, { clientX: 200 });
    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(300);
  });

  it("drags the thumb to scroll the track", () => {
    const { track } = renderList();
    const { thumb } = makeScrollable(track);

    fireEvent.pointerDown(thumb, { clientX: 200, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(thumb, { clientX: 260, pointerType: "mouse" });
    fireEvent.pointerUp(thumb);

    // dx 60 over a 400px bar with a 40% thumb: 60 / 400 / 0.6 * 600 = 150.
    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(150);
  });

  it("does not jump when the click follows a thumb drag", () => {
    const { track } = renderList();
    const { bar, thumb } = makeScrollable(track);

    fireEvent.pointerDown(thumb, { clientX: 200, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(thumb, { clientX: 260, pointerType: "mouse" });
    fireEvent.pointerUp(thumb);

    fireEvent.click(bar, { clientX: 350 });
    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(150);
  });

  it("supports keyboard scrolling on the bar", () => {
    const { track } = renderList();
    const { bar } = makeScrollable(track);

    fireEvent.keyDown(bar, { key: "ArrowRight" });
    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(60);

    fireEvent.keyDown(bar, { key: "End" });
    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(600);
  });
});

describe("LessonList drag-to-scroll", () => {
  it("drags the track with the mouse to scroll horizontally", () => {
    const { track } = renderList();
    mockScrollMetrics(track, { scrollWidth: 1000, clientWidth: 400 });

    fireEvent.pointerDown(track, { clientX: 200, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(track, { clientX: 150, pointerType: "mouse" });
    fireEvent.pointerUp(track);

    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(50);
  });

  it("shows a grabbing cursor while dragging", () => {
    const { track } = renderList();
    expect(track.className).toContain("cursor-grab");

    fireEvent.pointerDown(track, { clientX: 200, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(track, { clientX: 100, pointerType: "mouse" });
    expect(track.className).toContain("cursor-grabbing");

    fireEvent.pointerUp(track);
    expect(track.className).toContain("cursor-grab");
  });

  it("ignores drag gestures from touch so native scrolling keeps working", () => {
    const { track } = renderList();
    mockScrollMetrics(track, { scrollWidth: 1000, clientWidth: 400 });

    fireEvent.pointerDown(track, { clientX: 200, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(track, { clientX: 100, pointerType: "touch" });

    expect((track as HTMLElement & { scrollLeft: number }).scrollLeft).toBe(0);
  });

  it("still selects a lesson on a plain click without dragging", () => {
    const onSelectLesson = vi.fn();
    renderList(onSelectLesson);

    fireEvent.click(rowButton("Lesson 0"));
    expect(onSelectLesson).toHaveBeenCalledWith("l-0");
  });

  it("does not select a lesson when the pointer was dragged", () => {
    const onSelectLesson = vi.fn();
    const { track } = renderList(onSelectLesson);

    fireEvent.pointerDown(track, { clientX: 200, button: 0, pointerType: "mouse" });
    fireEvent.pointerMove(track, { clientX: 100, pointerType: "mouse" });
    fireEvent.pointerUp(track);

    fireEvent.click(rowButton("Lesson 0"));
    expect(onSelectLesson).not.toHaveBeenCalled();
  });
});
