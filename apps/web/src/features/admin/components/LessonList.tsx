import { useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "#/components/ui/skeleton.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table.tsx";
import { adminGetLessons, adminDeleteLesson } from "#/libs/admin-content-fns.ts";
import type { AdminLesson } from "#/libs/admin-content-fns.ts";
import { LessonFormDialog } from "./LessonFormDialog.tsx";

interface LessonListProps {
  unitId: string;
}

export function LessonList({ unitId }: LessonListProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons", unitId],
    queryFn: () => adminGetLessons({ data: { unitId } }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteLesson({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] }),
  });

  const allLessons: AdminLesson[] = lessons ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Daftar Lesson</h1>
        <LessonFormDialog
          unitId={unitId}
          trigger={
            <Button size="sm" className="w-36 text-sm">
              <Plus className="size-4" /> Tambah Lesson
            </Button>
          }
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Judul</TableHead>
              <TableHead className="w-20 text-center font-bold">Urutan</TableHead>
              <TableHead className="w-24 text-right font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-5 w-6" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            {!isLoading && allLessons.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="p-6 text-center text-base text-muted-foreground">
                  Belum ada lesson. Tambahkan lesson baru di atas.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              allLessons.map((lesson, i) => (
                <TableRow key={lesson.id} className="hover:bg-card/30">
                  <TableCell>
                    <button
                      type="button"
                      className="text-left"
                      onClick={() =>
                        navigate({
                          to: "/admin/$unitId/$lessonId",
                          params: { unitId, lessonId: lesson.id },
                        })
                      }
                    >
                      <div className="text-base font-medium text-foreground hover:underline">
                        {lesson.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{lesson.id}</div>
                    </button>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <LessonFormDialog
                        unitId={unitId}
                        lesson={lesson}
                        trigger={
                          <Button variant="shadowless" size="icon" aria-label="Edit lesson">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="shadowless"
                            size="icon"
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
                              beserta semua screen di dalamnya secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(lesson.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
