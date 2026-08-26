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
import { LessonFormDialog } from "./LessonFormDialog.tsx";

interface LessonListProps {
  unitId: string;
}

export function LessonList({ unitId }: LessonListProps) {
  const unit = useContentStore((s) => s.units[unitId]);
  const lessonIds = useContentStore((s) => s.units[unitId]?.lessonIds ?? []);
  const lessons = useContentStore((s) =>
    (s.units[unitId]?.lessonIds ?? []).map((id) => ({
      ...s.lessons[id],
      screenCount: s.lessons[id]?.screenIds.length ?? 0,
    })),
  );
  const addLesson = useContentStore((s) => s.addLesson);
  const updateLesson = useContentStore((s) => s.updateLesson);
  const deleteLesson = useContentStore((s) => s.deleteLesson);
  const reorderLessons = useContentStore((s) => s.reorderLessons);

  function moveLesson(index: number, direction: "up" | "down") {
    const next = [...lessonIds];
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderLessons(unitId, next);
  }

  if (!unit) {
    return <p className="p-4 text-muted-foreground">Unit not found.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link to="/admin" className="text-primary hover:underline">
          Units
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{unit.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Lessons</h2>
        <LessonFormDialog
          trigger={
            <Button size="sm">
              <Plus className="size-4" />
              Add lesson
            </Button>
          }
          onSave={(values) => addLesson(unitId, values)}
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-card/50">
              <th className="p-3 text-left text-sm font-medium text-card-foreground">Title</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Screens</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Order</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                  No lessons yet. Add one above.
                </td>
              </tr>
            )}
            {lessons.map((lesson, index) => {
              if (!lesson.id) return null;
              return (
                <tr key={lesson.id} className="border-b last:border-0 hover:bg-card/30">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground">{lesson.id}</div>
                  </td>
                  <td className="p-3 text-center text-sm tabular-nums">{lesson.screenCount}</td>

                  {/* Order */}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() => moveLesson(index, "up")}
                        aria-label="Move up"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === lessons.length - 1}
                        onClick={() => moveLesson(index, "down")}
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
                          to="/admin/$unitId/$lessonId"
                          params={{ unitId, lessonId: lesson.id }}
                          aria-label="View screens"
                        >
                          <span className="sr-only">View</span>
                          <span className="text-xs font-medium text-primary">View</span>
                        </Link>
                      </Button>

                      <LessonFormDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label="Edit lesson"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                        initialValues={{ id: lesson.id, title: lesson.title }}
                        onSave={({ title }) => updateLesson(lesson.id, { title })}
                      />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            aria-label="Delete lesson"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{" "}
                              <span className="font-medium text-foreground">{lesson.title}</span>{" "}
                              and all its screens. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteLesson(lesson.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
