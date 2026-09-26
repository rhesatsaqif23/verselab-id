// Regression tests: the bottom-bar Mulai CTA must keep its icon and label in
// a single row. Tailwind preflight makes svg display:block, so the icon
// stacks above the label whenever the button content sits inside a plain
// inline <a>/<span> instead of a flex container.
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LessonCta from "#/features/unit-detail/components/LessonCta.tsx";
import UnitMapBottomBar from "#/features/unit-detail/components/UnitMapBottomBar.tsx";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { Lesson, Unit } from "#/engine/types.ts";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
    onClick,
    onMouseEnter,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    onMouseEnter?: (e: React.MouseEvent) => void;
  }) => (
    <a href={to} className={className} onClick={onClick} onMouseEnter={onMouseEnter}>
      {children}
    </a>
  ),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ prefetchQuery: vi.fn() }),
}));

const concept = { type: "concept", prompt: "P", explain: "E" } as const;
const prereqLesson: Lesson = { id: "l-1", title: "Dasar", screens: [concept] };
const lesson: Lesson = {
  id: "l-2",
  title: "Lanjutan",
  prerequisiteIds: ["l-1"],
  screens: [concept],
};

/** The element holding the icon must be flex so icon + label stay in one row. */
function expectSingleRow(container: HTMLElement) {
  const icon = container.querySelector("svg");
  expect(icon).not.toBeNull();
  const holder = icon?.parentElement;
  expect(holder).toHaveClass("inline-flex");
  expect(holder).toHaveClass("items-center");
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ completedLessons: [] });
});

describe("LessonCta", () => {
  it("keeps icon and label in one row when prerequisites are unmet", () => {
    render(
      <LessonCta lesson={lesson} status="current" isVisible allLessons={[prereqLesson, lesson]} />,
    );

    const link = screen.getByRole("link", { name: /Mulai/ });
    expect(link).toHaveClass("inline-flex");
    expectSingleRow(link);
  });

  it("still opens the prerequisite dialog instead of navigating", async () => {
    render(
      <LessonCta lesson={lesson} status="current" isVisible allLessons={[prereqLesson, lesson]} />,
    );

    fireEvent.click(screen.getByRole("link", { name: /Mulai/ }));
    expect(await screen.findByText("Prasyarat belum terpenuhi")).toBeInTheDocument();
  });

  it("keeps one row when prerequisites are met", () => {
    useProgressStore.setState({ completedLessons: ["l-1"] });
    render(
      <LessonCta lesson={lesson} status="current" isVisible allLessons={[prereqLesson, lesson]} />,
    );

    const link = screen.getByRole("link", { name: /Mulai/ });
    expect(link).toHaveClass("inline-flex");
    expectSingleRow(link);
  });

  it("keeps the disabled Main Lagi icon on the same line", () => {
    render(
      <LessonCta
        lesson={{ id: "l-3", title: "Kosong", screens: [] }}
        status="previous"
        isVisible
      />,
    );

    const button = screen.getByRole("button", { name: /Main Lagi/ });
    expect(button).toBeDisabled();
    expectSingleRow(button);
  });
});

describe("UnitMapBottomBar", () => {
  const unit: Unit = { id: "u-1", slug: "u-1", title: "Unit 1", lessons: [prereqLesson, lesson] };

  it("keeps icon and label in one row when prerequisites are unmet", () => {
    render(
      <UnitMapBottomBar
        unit={unit}
        completedLessons={[]}
        selectedLesson={lesson}
        status="current"
        allLessons={[...unit.lessons]}
      />,
    );

    const link = screen.getByRole("link", { name: /Mulai/ });
    expect(link).toHaveClass("inline-flex");
    expectSingleRow(link);
  });

  it("keeps one row when prerequisites are met", () => {
    render(
      <UnitMapBottomBar
        unit={unit}
        completedLessons={["l-1"]}
        selectedLesson={lesson}
        status="current"
        allLessons={[...unit.lessons]}
      />,
    );

    const link = screen.getByRole("link", { name: /Mulai/ });
    expect(link).toHaveClass("inline-flex");
    expectSingleRow(link);
  });
});
