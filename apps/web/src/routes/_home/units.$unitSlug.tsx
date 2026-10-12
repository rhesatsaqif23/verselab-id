// Unit detail route: /units/$unitSlug — shows full unit info and lesson list.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getUnitWithContentBySlug } from "#/libs/content-fns.ts";
import { UnitDetailPage } from "../../features/unit-detail/index.tsx";

const searchSchema = z.object({
  lessonId: z.string().optional(),
});

export const Route = createFileRoute("/_home/units/$unitSlug")({
  validateSearch: searchSchema,
  loader: async ({ params }) => {
    const unit = await getUnitWithContentBySlug({ data: params.unitSlug });
    if (!unit) throw notFound();
    return { unit };
  },
  component: UnitDetailRoute,
});

function UnitDetailRoute() {
  const { unit } = Route.useLoaderData();
  const { units } = Route.useRouteContext();
  const { lessonId } = Route.useSearch();
  return <UnitDetailPage unit={unit} allUnits={units} initialLessonId={lessonId} />;
}
