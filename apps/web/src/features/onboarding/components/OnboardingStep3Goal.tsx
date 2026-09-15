// Step 3: Daily goal selection — how often does the user want to learn?
import SelectableCard from "./SelectableCard";
import { DAILY_GOAL_OPTIONS } from "../constants.ts";

export default function OnboardingStep3Goal({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 animate-slide-up-enter">
      <div className="grid gap-3">
        {DAILY_GOAL_OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            selected={value === option.value}
            onSelect={() => onSelect(option.value)}
            label={option.label}
            subtitle={option.description}
            className="flex-col items-start"
          />
        ))}
      </div>
    </div>
  );
}
