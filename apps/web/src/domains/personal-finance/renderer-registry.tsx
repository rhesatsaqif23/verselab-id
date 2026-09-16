// Personal-finance domain: maps screen types to their React renderers.
import type { ReactNode } from "react";
import type { Screen } from "#/engine/types.ts";
import ChoiceRenderer from "./screens/ChoiceRenderer.tsx";
import ConceptRenderer from "./screens/ConceptRenderer.tsx";
import NumericRenderer from "./screens/NumericRenderer.tsx";
import AllocationRenderer from "./screens/AllocationRenderer.tsx";

export type ScreenRenderer = (
  screen: Screen,
  onChange: (answer: unknown) => void,
  checked: boolean | null,
) => ReactNode;

export const renderers: Record<Screen["type"], ScreenRenderer> = {
  concept: (screen, _onChange, _checked) => (
    <ConceptRenderer screen={screen as Screen & { type: "concept" }} />
  ),
  choice: (screen, onChange, checked) => (
    <ChoiceRenderer
      screen={screen as Screen & { type: "choice" }}
      onSelect={(id) => onChange(id)}
      checked={checked}
    />
  ),
  numeric: (screen, onChange, checked) => (
    <NumericRenderer
      screen={screen as Screen & { type: "numeric" }}
      onChange={(value) => onChange(value)}
      checked={checked}
    />
  ),
  allocation: (screen, onChange, checked) => (
    <AllocationRenderer
      screen={screen as Screen & { type: "allocation" }}
      onChange={(allocation) => onChange(allocation)}
      checked={checked}
    />
  ),
};
