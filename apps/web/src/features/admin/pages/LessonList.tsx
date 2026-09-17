import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Input } from "#/components/ui/input.tsx";
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
import { LessonFormDialog } from "../components/LessonFormDialog.tsx";
import { SortableHead } from "../components/SortableHead.tsx";
import { useSortFilter } from "../hooks/useSortFilter.ts";

type LessonSortKey = "title" | "icon";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", unitId] });
      toast.success("Lesson berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus lesson");
    },
  });

  const allLessons: AdminLesson[] = lessons ?? [];

  const filterFn = useCallback((row: AdminLesson) => `${row.title} ${row.icon ?? ""}`, []);
  const getValue = useCallback((row: AdminLesson, key: LessonSortKey) => {
    if (key === "title") return row.title;
    if (key === "icon") return row.icon ?? "";
    return "";
  }, []);

  const { processed, sort, toggleSort, filter, setFilter } = useSortFilter<
    AdminLesson,
    LessonSortKey
  >(allLessons, "title", filterFn, getValue);

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

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="lessons-filter"
          placeholder="Cari lesson..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center font-bold">#</TableHead>
              <SortableHead label="Lesson" sortKey="title" sort={sort} onToggle={toggleSort} />
              <SortableHead label="Icon" sortKey="icon" sort={sort} onToggle={toggleSort} />
              <TableHead className="w-24 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mb-1 h-5 w-44" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && processed.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="p-6 text-center text-base text-muted-foreground">
                  {filter
                    ? `Tidak ada lesson yang cocok dengan "${filter}".`
                    : "Belum ada lesson. Tambahkan lesson baru di atas."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              processed.map((lesson, i) => (
                <TableRow
                  key={lesson.id}
                  className="cursor-pointer hover:bg-slate-100/70 transition-colors"
                  onClick={() =>
                    navigate({
                      to: "/admin/$unitId/$lessonId",
                      params: { unitId, lessonId: lesson.id },
                    })
                  }
                >
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-base font-semibold text-foreground">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground">{lesson.id}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lesson.icon || "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
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
