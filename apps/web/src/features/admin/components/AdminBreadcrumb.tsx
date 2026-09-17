import { Fragment } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb.tsx";
import { adminGetUnits, adminGetAllLessons } from "#/libs/admin-content-fns.ts";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  pelajaran: "Pelajaran",
  layar: "Layar",
  pengguna: "Pengguna",
};

function titleCase(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function AdminBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const { data: units } = useQuery({
    queryKey: ["admin-units"],
    queryFn: () => adminGetUnits(),
  });
  const { data: lessons } = useQuery({
    queryKey: ["admin-lessons-all"],
    queryFn: () => adminGetAllLessons(),
  });

  const unitTitleBySlug = new Map((units ?? []).map((u) => [u.slug, u.title]));
  const lessonTitleBySlug = new Map((lessons ?? []).map((l) => [l.slug, l.title]));

  if (segments.length === 0) {
    return null;
  }

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    let label = titleCase(seg);

    if (segmentLabels[seg]) {
      label = segmentLabels[seg];
    } else if (i === 1) {
      const resolved = unitTitleBySlug.get(seg);
      if (resolved) label = resolved;
    } else if (i === 2) {
      const resolved = lessonTitleBySlug.get(seg);
      if (resolved) label = resolved;
    }

    return { segment: seg, path, label };
  });

  if (crumbs.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{crumbs[0]?.label ?? "Admin"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={crumb.path}>
              {i > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="size-3.5" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
