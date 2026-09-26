// Domain renderer registry: aggregates all domain renderer maps.
// When adding a new domain, import its registry here and merge.
import type { Screen } from "#/engine/types.ts";
import type { ReactNode } from "react";
import { renderers as personalFinanceRenderers } from "#/domains/personal-finance/renderer-registry.tsx";

type ScreenRenderer = (
  screen: Screen,
  onChange: (answer: unknown) => void,
  checked: boolean | null,
) => ReactNode;

const registry: Record<Screen["type"], ScreenRenderer> = {
  ...personalFinanceRenderers,
};

export function renderScreen(
  screen: Screen,
  onChange: (answer: unknown) => void,
  checked: boolean | null,
): ReactNode {
  return registry[screen.type](screen, onChange, checked);
}
