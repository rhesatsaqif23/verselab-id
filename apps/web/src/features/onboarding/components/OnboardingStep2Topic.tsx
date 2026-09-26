// Step 2: Topic selection — which unit does the user want to start with?
import { useEffect, useState } from "react";
import SelectableCard from "./SelectableCard";
import { getUnits } from "#/libs/content-fns.ts";
import { UNIT_ICONS } from "#/features/home/constants.ts";
import { DEFAULT_ICON } from "../constants.ts";

export default function OnboardingStep2Topic({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (v: string) => void;
}) {
  const [units, setUnits] = useState<{ id: string; title: string; description?: string }[]>([]);

  useEffect(() => {
    let active = true;
    getUnits().then((data) => {
      if (active) setUnits(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 animate-slide-up-enter">
      <div className="grid gap-3">
        {units.map((unit) => {
          const Icon = UNIT_ICONS[unit.id] ?? DEFAULT_ICON;
          return (
            <SelectableCard
              key={unit.id}
              selected={value === unit.id}
              onSelect={() => onSelect(unit.id)}
              icon={Icon}
              label={unit.title}
              subtitle={unit.description}
            />
          );
        })}
      </div>
    </div>
  );
}
