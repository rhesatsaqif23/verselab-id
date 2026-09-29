// Prerequisite dialog is a recommendation, not a hard gate:
// titles (never raw ids), no row icon, and two ways out of the dialog.
import { describe, expect, it, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  PrerequisiteDialog,
  unmetPrerequisites,
} from "#/features/unit-detail/components/PrerequisiteDialog.tsx";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import type { Lesson } from "#/engine/types.ts";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    children,
    onClick,
  }: {
    to: string;
    params?: { lessonId: string };
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a href={to.replace("$lessonId", params?.lessonId ?? "")} onClick={onClick}>
      {children}
    </a>
  ),
}));

const concept = { type: "concept", prompt: "P", explain: "E" } as const;

const arusKas: Lesson = { id: "arus-kas-dasar", title: "Arus Kas Dasar", screens: [concept] };
const anggaran: Lesson = {
  id: "anggaran",
  title: "Anggaran & Prioritas",
  prerequisiteIds: ["arus-kas-dasar"],
  screens: [concept],
};

const allLessons = [arusKas, anggaran];

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ completedLessons: [] });
});

describe("unmetPrerequisites", () => {
  it("returns the prerequisite lesson when it is unfinished", () => {
    expect(unmetPrerequisites(anggaran, allLessons, [])).toEqual([arusKas]);
  });

  it("returns nothing once the prerequisite is finished", () => {
    expect(unmetPrerequisites(anggaran, allLessons, ["arus-kas-dasar"])).toEqual([]);
  });

  it("ignores stale prerequisite ids that no longer resolve to a lesson", () => {
    const stale: Lesson = {
      id: "anggaran-2",
      title: "Lanjutan",
      prerequisiteIds: ["deleted-lesson"],
      screens: [concept],
    };
    expect(unmetPrerequisites(stale, allLessons, [])).toEqual([]);
  });
});

describe("PrerequisiteDialog", () => {
  it("renders the prerequisite title instead of its id or slug", () => {
    render(
      <PrerequisiteDialog
        open
        onOpenChange={vi.fn()}
        lesson={anggaran}
        allLessons={allLessons}
        completedLessons={[]}
      />,
    );

    expect(screen.getByText("Arus Kas Dasar")).toBeInTheDocument();
    expect(screen.queryByText("arus-kas-dasar")).not.toBeInTheDocument();
  });

  it("has no icon inside the prerequisite row", () => {
    render(
      <PrerequisiteDialog
        open
        onOpenChange={vi.fn()}
        lesson={anggaran}
        allLessons={allLessons}
        completedLessons={[]}
      />,
    );

    const row = screen.getByText("Arus Kas Dasar").parentElement;
    expect(row).not.toBeNull();
    expect(row?.querySelector("svg")).toBeNull();
    // Only chrome icons remain: the dialog title warning + the close button
    // (Radix renders in a portal, so query the document, not the container).
    expect(document.querySelectorAll("svg")).toHaveLength(2);
  });

  it("offers both Lesson Sebelumnya and Tetap Lanjut", () => {
    render(
      <PrerequisiteDialog
        open
        onOpenChange={vi.fn()}
        lesson={anggaran}
        allLessons={allLessons}
        completedLessons={[]}
      />,
    );

    const previous = screen.getByRole("link", { name: "Lesson Sebelumnya" });
    const proceed = screen.getByRole("link", { name: "Tetap Lanjut" });
    expect(previous).toHaveAttribute("href", "/lesson/arus-kas-dasar");
    expect(proceed).toHaveAttribute("href", "/lesson/anggaran");
  });

  it("does not render when the prerequisite is already finished", () => {
    const { container } = render(
      <PrerequisiteDialog
        open
        onOpenChange={vi.fn()}
        lesson={anggaran}
        allLessons={allLessons}
        completedLessons={["arus-kas-dasar"]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("closes the dialog when either button is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <PrerequisiteDialog
        open
        onOpenChange={onOpenChange}
        lesson={anggaran}
        allLessons={allLessons}
        completedLessons={[]}
      />,
    );

    fireEvent.click(screen.getByRole("link", { name: "Lesson Sebelumnya" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("link", { name: "Tetap Lanjut" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
