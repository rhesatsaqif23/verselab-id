// Step 1: Purpose selection — why does the user want to learn?
import SelectableCard from "./SelectableCard";
import { PURPOSE_OPTIONS } from "../constants.ts";

export default function OnboardingStep1Purpose({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-slide-up-enter">
      <div className="grid gap-3 sm:grid-cols-2">
        {PURPOSE_OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            selected={value === option.value}
            onSelect={() => onSelect(option.value)}
            icon={option.icon}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
}
