import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import type { AdminScreen } from "#/libs/admin-content-fns.ts";

interface NumericFieldsProps {
  screen: AdminScreen;
  onChange: (patch: Partial<AdminScreen>) => void;
}

export function NumericFields({ screen, onChange }: NumericFieldsProps) {
  const min = screen.acceptRangeMin ?? "";
  const max = screen.acceptRangeMax ?? "";

  return (
    <div className="space-y-4 border-t pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unit-label" className="text-base">
          Satuan / Simbol (misal Rp, %)
        </Label>
        <Input
          id="unit-label"
          value={screen.numericUnit ?? ""}
          onChange={(e) => onChange({ numericUnit: e.target.value })}
          placeholder="Rp"
          className="md:text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min-range" className="text-base">
            Rentang Diterima (Min) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min-range"
            type="number"
            value={min}
            onChange={(e) =>
              onChange({
                acceptRangeMin: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="md:text-base"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="max-range" className="text-base">
            Rentang Diterima (Max) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="max-range"
            type="number"
            value={max}
            onChange={(e) =>
              onChange({
                acceptRangeMax: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="md:text-base"
          />
        </div>
      </div>
    </div>
  );
}
