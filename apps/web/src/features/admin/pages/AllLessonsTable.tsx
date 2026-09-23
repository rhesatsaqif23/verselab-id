import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatAdminDate } from "#/libs/date.ts";
import { resolveImageUrl } from "#/libs/image.ts";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination.tsx";
import { adminGetAllLessons, adminDeleteLesson } from "#/libs/admin-content-fns.ts";
import type { AdminLessonWithUnit } from "#/libs/admin-content-fns.ts";
import { LessonFormDialog } from "../components/LessonFormDialog.tsx";
import { SortableHead } from "../components/SortableHead.tsx";
import { useSortFilter } from "../hooks/useSortFilter.ts";

const PAGE_SIZE = 10;

type LessonSortKey = "title" | "unitTitle" | "createdAt";

export function AllLessonsTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-all-lessons"],
    queryFn: () => adminGetAllLessons(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteLesson({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-lessons"] });
      toast.success("Pelajaran berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus pelajaran");
    },
  });

  const all: AdminLessonWithUnit[] = lessons ?? [];
  const filterFn = useCallback(
    (row: AdminLessonWithUnit) => `${row.title} ${row.unitTitle} ${row.icon ?? ""}`,
    [],
  );
  const getValue = useCallback((row: AdminLessonWithUnit, key: LessonSortKey) => {
    if (key === "title") return row.title;
    if (key === "unitTitle") return row.unitTitle;
    if (key === "createdAt") return new Date(row.createdAt);
    return "";
  }, []);

  const { processed, sort, toggleSort, filter, setFilter } = useSortFilter<
    AdminLessonWithUnit,
    LessonSortKey
  >(all, "createdAt", filterFn, getValue);

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paged = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Pelajaran</h1>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="lessons-filter"
          placeholder="Cari pelajaran..."
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
              <SortableHead label="Pelajaran" sortKey="title" sort={sort} onToggle={toggleSort} />
              <SortableHead label="Unit" sortKey="unitTitle" sort={sort} onToggle={toggleSort} />
              <TableHead className="font-bold">Ikon</TableHead>
              <TableHead className="text-center font-bold">Gambar</TableHead>
              <SortableHead label="Dibuat" sortKey="createdAt" sort={sort} onToggle={toggleSort} />
              <TableHead className="w-24 text-center font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mb-1 h-5 w-44" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto size-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton className="size-8 rounded-lg" />
                      <Skeleton className="size-8 rounded-lg" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-6 text-center text-base text-muted-foreground">
                  {filter
                    ? `Tidak ada pelajaran yang cocok dengan "${filter}".`
                    : "Belum ada pelajaran."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((lesson, i) => (
                <TableRow
                  key={lesson.id}
                  className="cursor-pointer hover:bg-slate-100/70 transition-colors"
                  onClick={() =>
                    navigate({
                      to: "/admin/$unitSlug/$lessonSlug",
                      params: { unitSlug: lesson.unitSlug, lessonSlug: lesson.slug },
                    })
                  }
                >
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-base font-semibold text-foreground">{lesson.title}</div>
                    <div className="text-xs text-muted-foreground">{lesson.id}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{lesson.unitTitle}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lesson.icon || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {resolveImageUrl(lesson.imageUrl) ? (
                      <img
                        src={resolveImageUrl(lesson.imageUrl)}
                        alt={lesson.title}
                        className="mx-auto size-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatAdminDate(lesson.createdAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <LessonFormDialog
                        unitId={lesson.unitId}
                        lesson={lesson}
                        trigger={
                          <Button variant="shadowless" size="icon" aria-label="Edit pelajaran">
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
                            aria-label="Hapus pelajaran"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus pelajaran?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus{" "}
                              <span className="font-medium text-foreground">{lesson.title}</span>{" "}
                              beserta semua layar di dalamnya secara permanen.
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

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
