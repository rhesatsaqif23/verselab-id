// Tests for the concept screen renderer.
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import ConceptRenderer from "#/domains/personal-finance/screens/ConceptRenderer.tsx";

const demoScreen = {
  type: "concept" as const,
  prompt:
    "Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.",
  explain: "Bunga berbunga membuat tabungan tumbuh semakin cepat seiring waktu.",
};

describe("ConceptRenderer", () => {
  it("renders the prompt text", () => {
    render(<ConceptRenderer screen={demoScreen} />);
    expect(screen.getByText(demoScreen.prompt)).toBeInTheDocument();
  });

  it("does not render a button (player owns the Lanjut button)", () => {
    render(<ConceptRenderer screen={demoScreen} />);
    expect(screen.queryByRole("button", { name: /lanjut/i })).not.toBeInTheDocument();
  });
});
