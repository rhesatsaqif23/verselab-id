// Unit detail route: /units/$unitSlug — shows full unit info and lesson list.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getUnitWithContentBySlug } from "#/libs/content-fns.ts";
import { UnitDetailPage } from "../../features/unit-detail/index.tsx";

export const Route = createFileRoute("/_home/units/$unitSlug")({
  loader: async ({ params }) => {
    const unit = await getUnitWithContentBySlug({ data: params.unitSlug });
    if (!unit) throw notFound();
    return { unit };
  },
  component: UnitDetailRoute,
});

function UnitDetailRoute() {
  const { unit } = Route.useLoaderData();
  return <UnitDetailPage unit={unit} />;
}
