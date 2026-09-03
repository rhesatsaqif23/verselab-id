// Unit detail route: /units/$unitId — shows full unit info and lesson list.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { findUnit } from "#/content/index.ts";
import UnitDetailPage from "#/features/unit-detail/index.tsx";

export const Route = createFileRoute("/units/$unitId")({
  loader: ({ params }) => {
    const unit = findUnit(params.unitId);
    if (!unit) throw notFound();
    return { unit };
  },
  component: UnitDetailRoute,
});

function UnitDetailRoute() {
  const { unit } = Route.useLoaderData();
  return <UnitDetailPage unit={unit} />;
}