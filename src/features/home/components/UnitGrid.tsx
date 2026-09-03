// UnitGrid: grid of units with per-unit icons; selecting a unit changes the hero UnitCard.
import { Card } from "#/components/ui/card";
import { units } from "#/content/index.ts";
import { useHomeStore } from "../store.ts";
import { UNIT_ICONS } from "../constants.ts";

export default function UnitGrid() {
  const selectedUnitId = useHomeStore((s) => s.selectedUnitId);
  const setSelectedUnit = useHomeStore((s) => s.setSelectedUnit);

  return (
    <section className="w-full px-6 sm:px-10">
      <div className="grid grid-cols-2 items-center gap-3 lg:grid-cols-4">
        {units.map((unit) => {
          const isSelected = unit.id === selectedUnitId;
          const Icon = UNIT_ICONS[unit.id];

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setSelectedUnit(unit.id)}
              aria-pressed={isSelected}
              className="block h-full cursor-pointer"
            >
              <Card
                className={[
                  "flex h-full flex-col items-center justify-center gap-3 border-2 p-3 transition-all duration-150",
                  isSelected
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border hover:-translate-y-0.5 hover:border-primary/40",
                ].join(" ")}
              >
                <div className="flex h-12 w-12 items-center justify-center">
                  {unit.imageUrl ? (
                    <img
                      src={unit.imageUrl}
                      alt={unit.title}
                      className="h-11 w-11 object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                  ) : (
                    Icon && (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    )
                  )}
                </div>
                <p className="text-center text-sm font-bold leading-tight text-foreground">
                  {unit.title}
                </p>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
