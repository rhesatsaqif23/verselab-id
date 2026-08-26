import { contentStore, useContentStore } from "#/content/contentStore.ts";
import { Link, useParams } from "@tanstack/react-router";

type ContentState = ReturnType<typeof contentStore.getState>;

interface ScreenEditorProps {
  lessonId: string;
}

export function ScreenEditor({ lessonId }: ScreenEditorProps) {
  const { unitId } = useParams({ from: "/admin/$unitId/$lessonId" });
  const lesson = useContentStore((s: ContentState) => s.lessons[lessonId]);
  const screens = useContentStore((s: ContentState) =>
    (lesson?.screenIds ?? []).map((id) => s.screens[id]).filter(Boolean),
  );

  if (!lesson) {
    return <p className="p-4 text-muted-foreground">Lesson not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/admin" className="text-sm text-primary hover:underline">
          ← Units
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link
          to="/admin/$unitId"
          params={{ unitId }}
          className="text-sm text-primary hover:underline"
        >
          Lessons
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{lesson.title}</span>
      </div>

      <table className="w-full rounded-md border">
        <thead>
          <tr className="border-b bg-card/50">
            <th className="p-2 text-left font-medium text-card-foreground">Type</th>
            <th className="p-2 text-left font-medium text-card-foreground">Prompt</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {screens.map((screen, index) => (
            <tr key={screen!.id} className="border-b hover:bg-card/50">
              <td className="p-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  {screen!.type}
                </span>
              </td>
              <td className="p-2 text-sm">{screen!.prompt}</td>
              <td className="p-2 text-center text-sm text-muted-foreground">#{index + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
