// Tests for the multiple-choice screen renderer.
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChoiceRenderer from "#/domains/personal-finance/screens/ChoiceRenderer.tsx";

const demoScreen = {
  type: "choice" as const,
  prompt: "Manakah yang merupakan bunga berbunga?",
  options: [
    { id: "a", label: "Bunga ditambah pokok" },
    { id: "b", label: "Bunga dihitung dari pokok plus bunga sebelumnya" },
    { id: "c", label: "Bunga tetap setiap bulan" },
  ],
  correctId: "b",
  explain: "Bunga berbunga dihitung dari total pokok plus bunga yang sudah diperoleh sebelumnya.",
};

describe("ChoiceRenderer", () => {
  it("renders all option cards", () => {
    render(<ChoiceRenderer screen={demoScreen} onSelect={() => {}} checked={null} />);
    expect(screen.getByRole("button", { name: /bunga ditambah pokok/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bunga dihitung/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bunga tetap/i })).toBeInTheDocument();
  });

  it("renders the prompt", () => {
    render(<ChoiceRenderer screen={demoScreen} onSelect={() => {}} checked={null} />);
    expect(screen.getByText(demoScreen.prompt)).toBeInTheDocument();
  });

  it("calls onSelect with the correct id when an option is clicked", async () => {
    const onSelect = vi.fn();
    render(<ChoiceRenderer screen={demoScreen} onSelect={onSelect} checked={null} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /bunga dihitung/i }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("updates selection when a different option is clicked", async () => {
    const onSelect = vi.fn();
    render(<ChoiceRenderer screen={demoScreen} onSelect={onSelect} checked={null} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /bunga ditambah pokok/i }));
    await user.click(screen.getByRole("button", { name: /bunga tetap/i }));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith("c");
  });

  it("applies selected styling to the clicked option", async () => {
    render(<ChoiceRenderer screen={demoScreen} onSelect={() => {}} checked={null} />);
    const user = userEvent.setup();

    const btn = screen.getByRole("button", { name: /bunga ditambah pokok/i });
    await user.click(btn);
    expect(btn.className).toContain("border-primary");
  });
});
