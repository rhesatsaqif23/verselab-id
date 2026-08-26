import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import type { contentStore } from "#/content/contentStore.ts";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];

interface NumericFieldsProps {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}

export function NumericFields({ screen, onChange }: NumericFieldsProps) {
  const [min, max] = screen.acceptRange ?? [0, 0];

  return (
    <div className="space-y-4 border-t pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unit-label">Satuan / Simbol (misal Rp, %)</Label>
        <Input
          id="unit-label"
          value={screen.unit ?? ""}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="Rp"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min-range">Rentang Diterima (Min)</Label>
          <Input
            id="min-range"
            type="number"
            value={min}
            onChange={(e) => onChange({ acceptRange: [Number(e.target.value), max] })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="max-range">Rentang Diterima (Max)</Label>
          <Input
            id="max-range"
            type="number"
            value={max}
            onChange={(e) => onChange({ acceptRange: [min, Number(e.target.value)] })}
          />
        </div>
      </div>
    </div>
  );
}
