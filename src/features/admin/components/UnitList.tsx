import { contentStore, useContentStore } from "#/content/contentStore.ts";
import { Link } from "@tanstack/react-router";

type ContentState = ReturnType<typeof contentStore.getState>;

export function UnitList() {
  const units = useContentStore((s: ContentState) =>
    s.unitOrder.map((id) => ({
      ...s.units[id],
      lessonCount: s.units[id].lessonIds.length,
    })),
  );

  const handleDelete = (_id: string) => {
    if (window.confirm(`Are you sure you want to delete unit ${_id}`)) {
      // deleteUnit(_id) - CRUD implementation in later step
    }
  };

  return (
    <table className="w-full rounded-md border">
      <thead>
        <tr className="border-b bg-card/50">
          <th className="p-2 text-left font-medium text-card-foreground">Title</th>
          <th className="p-2">Lessons</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit) => (
          <tr key={unit.id} className="border-b hover:bg-card/50">
            <td className="p-2">{unit.title}</td>
            <td className="p-2">{unit.lessonCount}</td>
            <td className="p-2">
              <Link
                to="/admin/$unitId"
                params={{ unitId: unit.id }}
                className="text-sm text-primary hover:underline"
              >
                View
              </Link>
              <button
                className="ml-2 text-sm text-destructive hover:underline"
                onClick={() => handleDelete(unit.id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}