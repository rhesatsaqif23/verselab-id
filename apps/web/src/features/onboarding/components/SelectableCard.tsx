// SelectableCard: a card with icon + label that highlights on selection.
// Used across all onboarding wizard steps.
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "#/libs/utils.ts";

export default function SelectableCard({
  selected,
  onSelect,
  icon: Icon,
  label,
  subtitle,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: LucideIcon;
  label: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 bg-card p-4 text-left outline-none transition-all duration-150",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/50 hover:bg-accent/5",
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-white",
            !selected && "opacity-60",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-foreground">{label}</span>
          {selected && <Check className="mt-0.5 size-5 shrink-0 text-primary" />}
        </span>
        {subtitle && (
          <span className="mt-1 text-sm leading-5 text-muted-foreground">{subtitle}</span>
        )}
      </span>
    </button>
  );
}
