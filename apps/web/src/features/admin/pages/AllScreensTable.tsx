import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, Trash2 } from "lucide-react";
import { formatAdminDate } from "#/libs/date.ts";
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
  adminGetAllScreens,
  adminDeleteScreen,
  translateAdminError,
} from "#/libs/admin-content-fns.ts";
import type { AdminScreenWithLesson } from "#/libs/admin-content-fns.ts";
import { cn } from "#/libs/utils.ts";
import { AdminQueryError } from "../components/QueryError.tsx";
import { PaginationBar, DEFAULT_PAGE_SIZE } from "../components/PaginationBar.tsx";
import { SortableHead } from "../components/SortableHead.tsx";
import { useSortFilter } from "../hooks/useSortFilter.ts";

type ScreenSortKey = "prompt" | "lessonTitle" | "type" | "createdAt";

const typeLabels: Record<string, string> = {
  concept: "Konsep",
  choice: "Pilihan Ganda",
  numeric: "Numerik",
  allocation: "Alokasi",
};

const typeBadgeClass: Record<string, string> = {
  concept: "bg-primary-soft text-primary",
  choice: "bg-secondary text-secondary-foreground",
  numeric: "bg-numeric-soft text-numeric",
  allocation: "bg-allocation-soft text-allocation",
};

export function AllScreensTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: screens,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-all-screens"],
    queryFn: () => adminGetAllScreens(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteScreen({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-screens"] });
      toast.success("Layar berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(translateAdminError(err, "Gagal menghapus layar"));
    },
  });

  const all: AdminScreenWithLesson[] = screens ?? [];

  const filterFn = useCallback(
    (row: AdminScreenWithLesson) =>
      `${row.prompt} ${row.lessonTitle} ${typeLabels[row.type] ?? row.type}`,
    [],
  );
  const getValue = useCallback((row: AdminScreenWithLesson, key: ScreenSortKey) => {
    if (key === "prompt") return row.prompt;
    if (key === "lessonTitle") return row.lessonTitle;
    if (key === "type") return row.type;
    if (key === "createdAt") return new Date(row.createdAt);
    return "";
  }, []);

  const { processed, sort, toggleSort, filter, setFilter } = useSortFilter<
    AdminScreenWithLesson,
    ScreenSortKey
  >(all, "createdAt", filterFn, getValue);

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handlePageSizeChange(next: number) {
    setPageSize(next);
    setPage(1);
  }

  if (isError && !isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-foreground">Layar</h1>
        <AdminQueryError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Layar</h1>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="screens-filter"
          placeholder="Cari layar..."
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
              <SortableHead
                label="Prompt"
                sortKey="prompt"
                sort={sort}
                onToggle={toggleSort}
                className="max-w-xs"
              />
              <SortableHead
                label="Pelajaran"
                sortKey="lessonTitle"
                sort={sort}
                onToggle={toggleSort}
                className="max-w-40"
              />
              <SortableHead label="Tipe" sortKey="type" sort={sort} onToggle={toggleSort} />
              <SortableHead label="Dibuat" sortKey="createdAt" sort={sort} onToggle={toggleSort} />
              <TableHead className="w-20 text-right font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <Skeleton className="mb-1 h-5 w-56" />
                    <Skeleton className="h-3 w-28" />
                  </TableCell>
                  <TableCell className="max-w-40">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Skeleton className="size-8 rounded-lg" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="p-6 text-center text-base text-muted-foreground">
                  {filter ? `Tidak ada layar yang cocok dengan "${filter}".` : "Belum ada layar."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((screen, i) => (
                <TableRow
                  key={screen.id}
                  className="cursor-pointer hover:bg-card/30"
                  onClick={() =>
                    navigate({
                      to: "/admin/$unitSlug/$lessonSlug",
                      params: { unitSlug: screen.unitSlug, lessonSlug: screen.lessonSlug },
                      search: { screenId: screen.id },
                    })
                  }
                >
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {(page - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="truncate text-base font-medium text-foreground"
                      title={screen.prompt}
                    >
                      {screen.prompt}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{screen.id}</div>
                  </TableCell>
                  <TableCell className="max-w-40">
                    <span
                      className="block truncate text-sm text-muted-foreground"
                      title={screen.lessonTitle}
                    >
                      {screen.lessonTitle}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                        typeBadgeClass[screen.type],
                      )}
                    >
                      {typeLabels[screen.type] ?? screen.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatAdminDate(screen.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="shadowless"
                        size="icon"
                        aria-label="Edit layar"
                        onClick={() =>
                          navigate({
                            to: "/admin/$unitSlug/$lessonSlug",
                            params: { unitSlug: screen.unitSlug, lessonSlug: screen.lessonSlug },
                            search: { screenId: screen.id },
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="shadowless"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label="Hapus layar"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus layar?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus layar ini secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(screen.id)}
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

      {processed.length > 0 && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
