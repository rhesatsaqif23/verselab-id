import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { adminGetLessonBySlug } from "#/libs/admin-content-fns.ts";
import { ScreenEditor } from "#/features/admin/pages/ScreenEditor.tsx";

export const Route = createFileRoute("/admin/$unitSlug/$lessonSlug")({
  component: ScreenEditorRoute,
});

function ScreenEditorRoute() {
  const { lessonSlug } = Route.useParams();
  const location = useLocation();
  const screenId = new URLSearchParams(location.search).get("screenId") ?? undefined;

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["admin-lesson-by-slug", lessonSlug],
    queryFn: () => adminGetLessonBySlug({ data: { slug: lessonSlug } }),
  });

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Memuat lesson...</p>;
  }

  if (!lesson) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-base text-muted-foreground">Lesson tidak ditemukan.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">Kembali ke daftar unit</Link>
        </Button>
      </div>
    );
  }

  return <ScreenEditor lessonId={lesson.id} initialScreenId={screenId} />;
}
