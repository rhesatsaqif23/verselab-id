// UnitDetailPage: placeholder — full implementation in next step.
import type { Unit } from "#/engine/types.ts";

type Props = { unit: Unit };

export default function UnitDetailPage({ unit }: Props) {
  return (
    <main className="page-wrap px-4 py-8">
      <p className="text-lg font-bold">{unit.title}</p>
    </main>
  );
}
