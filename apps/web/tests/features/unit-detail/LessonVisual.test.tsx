// Tests for LessonVisual image-with-icon-fallback.
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LessonVisual } from "#/features/unit-detail/components/LessonVisual.tsx";
import type { Lesson } from "#/engine/types.ts";

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return { id: "l-1", title: "Segitiga Proyek", screens: [], ...overrides };
}

describe("LessonVisual", () => {
  it("renders the icon when the lesson has no image", () => {
    const { container } = render(
      <LessonVisual lesson={makeLesson({ icon: "Lightbulb" })} iconClassName="icon-x" />,
    );

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg.icon-x")).not.toBeNull();
  });

  it("renders the image when imageUrl is set", () => {
    render(
      <LessonVisual
        lesson={makeLesson({ imageUrl: "/uploads/lessons/l-1.png" })}
        imageClassName="image-x"
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Segitiga Proyek");
    expect(img.className).toContain("image-x");
  });

  it("falls back to the icon when the image fails to load", () => {
    const { container } = render(
      <LessonVisual
        lesson={makeLesson({ icon: "Lightbulb", imageUrl: "/uploads/lessons/l-1.png" })}
        iconClassName="icon-x"
      />,
    );

    fireEvent.error(screen.getByRole("img"));

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("svg.icon-x")).not.toBeNull();
  });
});
