import type { Unit } from "#/engine/types.ts";

type UnitHeaderProps = {
  unit: Unit;
};

export default function UnitHeader({ unit }: UnitHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 p-6 sm:p-8">
      {/* Left: illustration, slightly smaller */}
      <div className="flex shrink-0 items-center justify-center sm:w-36 md:w-44 lg:w-48">
        {unit.imageUrl ? (
          <img
            src={unit.imageUrl}
            alt={unit.title}
            draggable={false}
            className="h-32 sm:h-full max-h-40 w-auto select-none object-contain pointer-events-none"
          />
        ) : (
          <div className="flex size-32 sm:size-full min-h-32 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-4xl">
            {unit.title.charAt(0)}
          </div>
        )}
      </div>

      {/* Right: label, title, description in one column */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 text-center sm:text-left">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
          Unit Belajar
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight">
          {unit.title}
        </h1>
        {unit.description && (
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            {unit.description}
          </p>
        )}
      </div>
    </div>
  );
}
