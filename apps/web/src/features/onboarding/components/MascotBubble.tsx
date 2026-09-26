// MascotBubble: mascot avatar with an optional speech bubble. The mascot is the
// Verselab "V" logo — swap in a real mascot image when available.
import { cn } from "#/libs/utils.ts";

export default function MascotBubble({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-2xl font-black text-white shadow-md animate-bounce-in">
        V
      </div>
      {message && (
        <div className="relative mt-1 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-medium leading-5 text-foreground shadow-sm animate-slide-up-enter">
          {message}
          <div className="absolute -left-2 top-3 size-3 rotate-45 border-b-2 border-l-2 border-border bg-card" />
        </div>
      )}
    </div>
  );
}
