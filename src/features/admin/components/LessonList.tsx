import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button, buttonVariants } from "#/components/ui/button.tsx";
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
    return <p className="p-4 text-muted-foreground">Unit tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link to="/admin" className="text-primary hover:underline">
          Unit
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{unit.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Daftar Lesson</h2>
        <LessonFormDialog
          trigger={
            <Button size="sm" className="w-36">
              <Plus className="size-4" /> Tambah Lesson
            </Button>
          }
          onSave={(values) => addLesson(unitId, values)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-card/50">
              <th className="p-3 text-left text-sm font-medium text-card-foreground">Judul</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Screen</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Urutan</th>
              <th className="p-3 text-center text-sm font-medium text-card-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                  Belum ada lesson. Tambahkan lesson baru di atas.
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
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => moveLesson(index, "up")}
                        aria-label="Pindah ke atas"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === lessons.length - 1}
                        onClick={() => moveLesson(index, "down")}
                        aria-label="Pindah ke bawah"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        to="/admin/$unitId/$lessonId"
                        params={{ unitId, lessonId: lesson.id }}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                        })}
                        title="Lihat screen"
                        aria-label="Lihat screen"
                      >
                        <Eye className="size-4" />
                      </Link>

                      <LessonFormDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Edit lesson">
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
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label="Hapus lesson"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus lesson?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus lesson{" "}
                              <span className="font-medium text-foreground">{lesson.title}</span>{" "}
                              beserta semua screen di dalamnya secara permanen. Tindakan ini tidak
                              dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteLesson(lesson.id)}
                            >
                              Hapus
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
