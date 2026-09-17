import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "#/components/ui/table.tsx";
import { cn } from "#/libs/utils.ts";
import type { SortState } from "../hooks/useSortFilter.ts";

interface SortableHeadProps<K extends string> {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onToggle: (key: K) => void;
  className?: string;
}

export function SortableHead<K extends string>({
  label,
  sortKey,
  sort,
  onToggle,
  className,
}: SortableHeadProps<K>) {
  const isActive = sort.key === sortKey;

  return (
    <TableHead className={cn("cursor-pointer select-none", className)}>
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className="flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors"
      >
        {label}
        {isActive ? (
          sort.dir === "asc" ? (
            <ArrowUp className="size-3.5 text-primary" />
          ) : (
            <ArrowDown className="size-3.5 text-primary" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
        )}
      </button>
    </TableHead>
  );
}
