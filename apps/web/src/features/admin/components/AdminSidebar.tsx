import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, FileQuestion, LayoutGrid, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "#/components/ui/sidebar.tsx";
import { TooltipProvider } from "#/components/ui/tooltip.tsx";
import { cn } from "#/libs/utils.ts";

const navItems = [
  { to: "/admin" as const, label: "Unit", icon: LayoutGrid },
  { to: "/admin/pelajaran" as const, label: "Pelajaran", icon: BookOpen },
  { to: "/admin/layar" as const, label: "Layar", icon: FileQuestion },
  { to: "/admin/pengguna" as const, label: "Pengguna", icon: Users },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="bg-white">
        <SidebarHeader
          className={cn(
            "border-b border-border py-3 transition-all duration-200",
            isCollapsed ? "px-1.5" : "px-3",
          )}
        >
          <Link
            to="/admin"
            className={cn(
              "flex items-center no-underline transition-all duration-200",
              isCollapsed ? "justify-center gap-0" : "gap-2.5",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-white shadow-sm">
              V
            </span>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
                Verselab
              </span>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.to === "/admin"
                      ? location.pathname === "/admin" || location.pathname === "/admin/"
                      : location.pathname.startsWith(item.to);

                  const itemLink = (
                    <Link
                      to={item.to}
                      className={cn(
                        "group flex items-center rounded-lg outline-none transition-colors duration-200 w-full",
                        isCollapsed ? "justify-center size-8! p-0! gap-0" : "h-10 px-3 gap-3",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5 shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="text-[15px] font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        {itemLink}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
