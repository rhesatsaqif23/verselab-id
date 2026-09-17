import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { adminGetUnitBySlug } from "#/libs/admin-content-fns.ts";
import { LessonList } from "#/features/admin/pages/LessonList.tsx";

export const Route = createFileRoute("/admin/$unitSlug/")({
  component: LessonListRoute,
});

function LessonListRoute() {
  const { unitSlug } = Route.useParams();

  const { data: unit, isLoading } = useQuery({
    queryKey: ["admin-unit-by-slug", unitSlug],
    queryFn: () => adminGetUnitBySlug({ data: { slug: unitSlug } }),
  });

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Memuat unit...</p>;
  }

  if (!unit) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-base text-muted-foreground">Unit tidak ditemukan.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">Kembali ke daftar unit</Link>
        </Button>
      </div>
    );
  }

  return <LessonList unitId={unit.id} unitSlug={unit.slug} />;
}
