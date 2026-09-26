import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  dir: SortDir;
}

/**
 * Generic client-side sort + text-filter hook for admin tables.
 *
 * @param data       – raw array from the API
 * @param defaultKey – the field to sort by on first render (typically "createdAt")
 * @param filterFn   – returns the searchable string for each row
 * @param getValue   – returns the comparable value for a given sort key
 */
export function useSortFilter<T, K extends string>(
  data: T[],
  defaultKey: K,
  filterFn: (row: T) => string,
  getValue: (row: T, key: K) => string | number | Date | null | undefined,
) {
  const [sort, setSort] = useState<SortState<K>>({ key: defaultKey, dir: "desc" });
  const [filter, setFilter] = useState("");

  function toggleSort(key: K) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const processed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q ? data.filter((row) => filterFn(row).toLowerCase().includes(q)) : data;

    return [...filtered].sort((a, b) => {
      const av = getValue(a, sort.key);
      const bv = getValue(b, sort.key);

      let cmp = 0;
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = 1;
      else if (bv == null) cmp = -1;
      else if (av instanceof Date && bv instanceof Date) cmp = av.getTime() - bv.getTime();
      else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), "id");

      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, filter, sort, filterFn, getValue]);

  return { processed, sort, toggleSort, filter, setFilter };
}
