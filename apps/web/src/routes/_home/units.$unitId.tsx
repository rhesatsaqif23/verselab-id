// Unit detail route: /units/$unitId — shows full unit info and lesson list.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getUnitWithContent } from "#/libs/content-fns.ts";
import { UnitDetailPage } from "#/features/unit-detail/index.tsx";

export const Route = createFileRoute("/_home/units/$unitId")({
  loader: async ({ params }) => {
    const unit = await getUnitWithContent({ data: params.unitId });
    if (!unit) throw notFound();
    return { unit };
  },
  component: UnitDetailRoute,
});

function UnitDetailRoute() {
  const { unit } = Route.useLoaderData();
  return <UnitDetailPage unit={unit} />;
}
