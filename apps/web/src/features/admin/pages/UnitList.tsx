import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { adminGetUnits, adminDeleteUnit, translateAdminError } from "#/libs/admin-content-fns.ts";
import type { AdminUnit } from "#/libs/admin-content-fns.ts";
import { UnitFormDialog } from "../components/UnitFormDialog.tsx";
import { AdminQueryError } from "../components/QueryError.tsx";
import { SortableHead } from "../components/SortableHead.tsx";
import { useSortFilter } from "../hooks/useSortFilter.ts";

const PAGE_SIZE = 10;

type UnitSortKey = "title" | "description" | "createdAt";

export function UnitList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const {
    data: units,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-units"],
    queryFn: () => adminGetUnits(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteUnit({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      toast.success("Unit berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(translateAdminError(err, "Gagal menghapus unit"));
    },
  });

  const allUnits: AdminUnit[] = units ?? [];

  const filterFn = useCallback((row: AdminUnit) => `${row.title} ${row.description ?? ""}`, []);
  const getValue = useCallback((row: AdminUnit, key: UnitSortKey) => {
    if (key === "title") return row.title;
    if (key === "description") return row.description ?? "";
    if (key === "createdAt") return new Date(row.createdAt);
    return "";
  }, []);

  const { processed, sort, toggleSort, filter, setFilter } = useSortFilter<AdminUnit, UnitSortKey>(
    allUnits,
    "createdAt",
    filterFn,
    getValue,
  );

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paged = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (isError && !isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-foreground">Konten</h1>
        <AdminQueryError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Konten</h1>
        <UnitFormDialog
          trigger={
            <Button size="sm" className="w-36 text-sm">
              <Plus className="size-4" /> Tambah Unit
            </Button>
          }
        />
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="units-filter"
          placeholder="Cari unit..."
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
              <SortableHead label="Unit" sortKey="title" sort={sort} onToggle={toggleSort} />
              <SortableHead
                label="Deskripsi"
                sortKey="description"
                sort={sort}
                onToggle={toggleSort}
              />
              <TableHead className="w-20 text-center font-bold">Gambar</TableHead>
              <SortableHead
                label="Dibuat"
                sortKey="createdAt"
                sort={sort}
                onToggle={toggleSort}
                className="w-24"
              />
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
                    <Skeleton className="mb-1 h-5 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mb-1 h-4 w-64" />
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto size-12 rounded-lg" />
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
                <TableCell colSpan={6} className="p-6 text-center text-base text-muted-foreground">
                  {filter
                    ? `Tidak ada unit yang cocok dengan "${filter}".`
                    : "Belum ada unit. Tambahkan unit baru di atas."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((unit, i) => (
                <TableRow
                  key={unit.id}
                  className="cursor-pointer hover:bg-slate-100/70 transition-colors"
                  onClick={() =>
                    navigate({ to: "/admin/$unitSlug", params: { unitSlug: unit.slug } })
                  }
                >
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-base font-semibold text-foreground">{unit.title}</div>
                    <div className="text-xs text-muted-foreground">{unit.id}</div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {unit.description || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {unit.imageUrl ? (
                      <img
                        src={resolveImageUrl(unit.imageUrl)}
                        alt={unit.title}
                        className="mx-auto size-12 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatAdminDate(unit.createdAt)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <UnitFormDialog
                        trigger={
                          <Button variant="shadowless" size="icon" aria-label="Edit unit">
                            <Pencil className="size-4" />
                          </Button>
                        }
                        unit={unit}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="shadowless"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label="Hapus unit"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus unit?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus unit{" "}
                              <span className="font-medium text-foreground">{unit.title}</span>{" "}
                              beserta semua lesson dan screen di dalamnya secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(unit.id)}
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
