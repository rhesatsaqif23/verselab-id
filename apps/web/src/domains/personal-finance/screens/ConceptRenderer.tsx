// ConceptRenderer: plain text block that introduces a concept.
import type { Screen } from "#/engine/types.ts";

type ConceptRendererProps = {
  screen: Extract<Screen, { type: "concept" }>;
};

export default function ConceptRenderer({ screen }: ConceptRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-lg font-medium leading-relaxed">{screen.prompt}</p>
    </div>
  );
}
