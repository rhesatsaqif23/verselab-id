import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield } from "lucide-react";
import { Badge } from "#/components/ui/badge.tsx";
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
import { adminGetUsers } from "#/libs/admin-content-fns.ts";
import type { AdminUser } from "#/libs/admin-content-fns.ts";
import { SortableHead } from "../components/SortableHead.tsx";
import { useSortFilter } from "../hooks/useSortFilter.ts";

const PAGE_SIZE = 15;

type UserSortKey = "displayName" | "email" | "role" | "onboardedAt" | "createdAt";

function getInitial(name?: string | null, email?: string | null): string {
  const str = name?.trim() || email?.trim() || "?";
  return str.charAt(0).toUpperCase();
}

export function UsersTable() {
  const [page, setPage] = useState(1);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminGetUsers(),
  });

  if (error) {
    toast.error("Gagal memuat data pengguna");
  }

  const all: AdminUser[] = users ?? [];

  const filterFn = useCallback(
    (row: AdminUser) => `${row.displayName ?? ""} ${row.name ?? ""} ${row.email ?? ""}`,
    [],
  );
  const getValue = useCallback((row: AdminUser, key: UserSortKey) => {
    if (key === "displayName") return row.displayName ?? row.name ?? "";
    if (key === "email") return row.email ?? "";
    if (key === "role") return row.role;
    if (key === "onboardedAt") return row.onboardedAt ? new Date(row.onboardedAt) : null;
    if (key === "createdAt") return new Date(row.createdAt);
    return "";
  }, []);

  const { processed, sort, toggleSort, filter, setFilter } = useSortFilter<AdminUser, UserSortKey>(
    all,
    "createdAt",
    filterFn,
    getValue,
  );

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paged = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Pengguna</h1>
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="users-filter"
          placeholder="Cari pengguna..."
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
              <SortableHead label="Nama" sortKey="displayName" sort={sort} onToggle={toggleSort} />
              <SortableHead label="Email" sortKey="email" sort={sort} onToggle={toggleSort} />
              <SortableHead label="Role" sortKey="role" sort={sort} onToggle={toggleSort} />
              <SortableHead
                label="Status"
                sortKey="onboardedAt"
                sort={sort}
                onToggle={toggleSort}
              />
              <SortableHead
                label="Terdaftar"
                sortKey="createdAt"
                sort={sort}
                onToggle={toggleSort}
              />
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
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 shrink-0 rounded-full" />
                      <div>
                        <Skeleton className="mb-1 h-5 w-36" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="p-6 text-center text-base text-muted-foreground">
                  {filter
                    ? `Tidak ada pengguna yang cocok dengan "${filter}".`
                    : "Belum ada pengguna."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              paged.map((u, i) => {
                const userName = u.displayName || u.name || "User";
                const initial = getInitial(userName, u.email);

                return (
                  <TableRow key={u.id} className="hover:bg-slate-100/70 transition-colors">
                    <TableCell className="text-center tabular-nums text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {u.avatarUrl || u.image ? (
                          <img
                            src={u.avatarUrl ?? u.image ?? ""}
                            alt={userName}
                            className="size-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shadow-xs">
                            {initial}
                          </div>
                        )}
                        <div>
                          <div className="text-base font-semibold text-foreground">{userName}</div>
                          <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{u.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" && <Shield className="mr-1 size-3" />}
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.onboardedAt ? "default" : "outline"}>
                        {u.onboardedAt ? "Aktif" : "Belum Onboard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
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
