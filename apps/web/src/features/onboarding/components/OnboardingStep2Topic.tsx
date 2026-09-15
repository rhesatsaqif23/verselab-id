// Step 2: Topic selection — which unit does the user want to start with?
import SelectableCard from "./SelectableCard";
import { START_UNIT_OPTIONS } from "../constants.ts";

export default function OnboardingStep2Topic({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-slide-up-enter">
      <div className="grid gap-3">
        {START_UNIT_OPTIONS.map((unit) => (
          <SelectableCard
            key={unit.id}
            selected={value === unit.id}
            onSelect={() => onSelect(unit.id)}
            icon={unit.icon}
            label={unit.title}
            subtitle={unit.description}
          />
        ))}
      </div>
    </div>
  );
}
