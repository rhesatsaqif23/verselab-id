// Date utilities shared across the app (today, arithmetic, formatting).

export function todayString(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Normalize a date-like string (YYYY-MM-DD or ISO timestamp) to YYYY-MM-DD.
 * Values without a recognizable date prefix are returned unchanged.
 */
export function dateOnly(value: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return m ? m[1] : value;
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${dateOnly(from)}T00:00:00`).getTime();
  const b = new Date(`${dateOnly(to)}T00:00:00`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function getWeekDates(today: Date): Date[] {
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatAdminDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
