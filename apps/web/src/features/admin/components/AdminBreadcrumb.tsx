import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb.tsx";

const segmentLabels: Record<string, string> = {
  admin: "Admin",
  users: "Users",
};

export function AdminBreadcrumb() {
  const matches = useMatches();

  const crumbs = matches
    .filter((m) => m.pathname !== "/")
    .map((m) => {
      const segments = m.pathname.split("/").filter(Boolean);
      return segments.map((seg) => ({
        segment: seg,
        label: segmentLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      }));
    })
    .flat();

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
          const path = "/" + crumbs.slice(0, i + 1).join("/");
          return (
            <BreadcrumbItem key={path}>
              {i > 0 && <BreadcrumbSeparator><ChevronRight className="size-3" /></BreadcrumbSeparator>}
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
