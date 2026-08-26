import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { useContentStore } from "#/content/contentStore.ts";
import { UnitFormDialog } from "./UnitFormDialog.tsx";

export function UnitList() {
  const unitOrder = useContentStore((s) => s.unitOrder);
  const units = useContentStore((s) =>
    s.unitOrder.map((id) => ({
      ...s.units[id],
      lessonCount: s.units[id].lessonIds.length,
    })),
  );
  const addUnit = useContentStore((s) => s.addUnit);
  const updateUnit = useContentStore((s) => s.updateUnit);
  const deleteUnit = useContentStore((s) => s.deleteUnit);
  const reorderUnits = useContentStore((s) => s.reorderUnits);

  function moveUnit(index: number, direction: "up" | "down") {
    const next = [...unitOrder];
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderUnits(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Units</h2>
        <UnitFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add unit
            </Button>
          }
          onSave={(values) => addUnit(values)}
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-card/50">
              <th className="p-3 text-left text-sm font-medium text-card-foreground">Title</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Lessons</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Order</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                  No units yet. Add one above.
                </td>
              </tr>
            )}
            {units.map((unit, index) => (
              <tr key={unit.id} className="border-b last:border-0 hover:bg-card/30">
                <td className="p-3">
                  <div className="font-medium text-foreground">{unit.title}</div>
                  <div className="text-xs text-muted-foreground">{unit.id}</div>
                </td>
                <td className="p-3 text-center text-sm tabular-nums">{unit.lessonCount}</td>

                {/* Order */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === 0}
                      onClick={() => moveUnit(index, "up")}
                      aria-label="Move up"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      disabled={index === units.length - 1}
                      onClick={() => moveUnit(index, "down")}
                      aria-label="Move down"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="size-7" asChild>
                      <Link
                        to="/admin/$unitId"
                        params={{ unitId: unit.id }}
                        aria-label="View lessons"
                      >
                        <span className="sr-only">View</span>
                        <span className="text-xs font-medium text-primary">View</span>
                      </Link>
                    </Button>

                    <UnitFormDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label="Edit unit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      }
                      initialValues={{ id: unit.id, title: unit.title, imageUrl: unit.imageUrl }}
                      onSave={({ title, imageUrl }) => updateUnit(unit.id, { title, imageUrl })}
                    />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          aria-label="Delete unit"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete unit?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-medium text-foreground">{unit.title}</span> and
                            all its lessons and screens. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteUnit(unit.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
