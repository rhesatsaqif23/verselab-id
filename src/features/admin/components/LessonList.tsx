import { contentStore, useContentStore } from "#/content/contentStore.ts";
import { Link } from "@tanstack/react-router";

type ContentState = ReturnType<typeof contentStore.getState>;

interface LessonListProps {
  unitId: string;
}

export function LessonList({ unitId }: LessonListProps) {
  const unit = useContentStore((s: ContentState) => s.units[unitId]);
  const lessons = useContentStore((s: ContentState) =>
    (unit?.lessonIds ?? []).map((id) => s.lessons[id]).filter(Boolean),
  );

  const handleDelete = (_id: string) => {
    if (window.confirm(`Are you sure you want to delete lesson ${_id}`)) {
      // deleteLesson(_id) - CRUD implementation in later step
    }
  };

  if (!unit) {
    return <p className="p-4 text-muted-foreground">Unit not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/admin" className="text-sm text-primary hover:underline">
          ← Units
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{unit.title}</span>
      </div>

      <table className="w-full rounded-md border">
        <thead>
          <tr className="border-b bg-card/50">
            <th className="p-2 text-left font-medium text-card-foreground">Title</th>
            <th className="p-2">Screens</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson!.id} className="border-b hover:bg-card/50">
              <td className="p-2">{lesson!.title}</td>
              <td className="p-2 text-center">{lesson!.screenIds.length}</td>
              <td className="p-2">
                <Link
                  to="/admin/$unitId/$lessonId"
                  params={{ unitId, lessonId: lesson!.id }}
                  className="text-sm text-primary hover:underline"
                >
                  View
                </Link>
                <button
                  className="ml-2 text-sm text-destructive hover:underline"
                  onClick={() => handleDelete(lesson!.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
