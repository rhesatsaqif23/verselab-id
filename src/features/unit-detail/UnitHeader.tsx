import type { Unit } from "#/engine/types.ts";

type UnitHeaderProps = {
  unit: Unit;
};

export default function UnitHeader({ unit }: UnitHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Unit badge/category and favorite/share if applicable */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {unit.imageUrl ? (
            <img
              src={unit.imageUrl}
              alt={unit.title}
              className="size-16 sm:size-20 object-contain select-none pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-2xl">
              {unit.title.charAt(0)}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Unit Belajar
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              {unit.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Description subtitle */}
      {unit.description && (
        <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
          {unit.description}
        </p>
      )}
    </div>
  );
}
