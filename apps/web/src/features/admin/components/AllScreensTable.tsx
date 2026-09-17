import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
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
import { Badge } from "#/components/ui/badge.tsx";
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
import { adminGetAllScreens, adminDeleteScreen } from "#/libs/admin-content-fns.ts";
import type { AdminScreenWithLesson } from "#/libs/admin-content-fns.ts";

const PAGE_SIZE = 15;

const typeLabels: Record<string, string> = {
  concept: "Konsep",
  choice: "Pilihan Ganda",
  numeric: "Numerik",
  allocation: "Alokasi",
};

const typeBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  concept: "default",
  choice: "secondary",
  numeric: "outline",
  allocation: "outline",
};

export function AllScreensTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: screens, isLoading } = useQuery({
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
      toast.error(err.message || "Gagal menghapus layar");
    },
  });

  const all: AdminScreenWithLesson[] = screens ?? [];
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const paged = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Layar</h1>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center font-bold">#</TableHead>
              <TableHead className="max-w-xs font-bold">Prompt</TableHead>
              <TableHead className="max-w-[10rem] font-bold">Pelajaran</TableHead>
              <TableHead className="font-bold">Tipe</TableHead>
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
                  <TableCell className="max-w-[10rem]">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
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
                <TableCell colSpan={5} className="p-6 text-center text-base text-muted-foreground">
                  Belum ada layar.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((screen, i) => (
                <TableRow key={screen.id} className="hover:bg-card/30">
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + i + 1}
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
                  <TableCell className="max-w-[10rem]">
                    <span
                      className="block truncate text-sm text-muted-foreground"
                      title={screen.lessonTitle}
                    >
                      {screen.lessonTitle}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant[screen.type] ?? "outline"}>
                      {typeLabels[screen.type] ?? screen.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="shadowless"
                        size="icon"
                        aria-label="Edit layar"
                        onClick={() =>
                          navigate({
                            to: "/admin/$unitId/$lessonId",
                            params: { unitId: screen.unitId, lessonId: screen.lessonId },
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
