import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, PanelLeftClose, PanelLeftOpen, Users } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "#/components/ui/sidebar.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip.tsx";
import { cn } from "#/libs/utils.ts";

const navItems = [
  { to: "/admin" as const, label: "Konten", icon: BookOpen },
];

export function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="bg-white">
        <SidebarHeader className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5 no-underline">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-sans text-base font-bold text-white">
                V
              </span>
              <span
                className={cn(
                  "text-lg font-bold tracking-tight text-foreground transition-all duration-300 whitespace-nowrap",
                  isCollapsed
                    ? "pointer-events-none w-0 -translate-x-2 opacity-0"
                    : "w-auto translate-x-0 opacity-100",
                )}
              >
                Verselab
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.to);

                  const itemLink = (
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center rounded-lg transition-colors duration-200 h-9 gap-3 outline-none w-full",
                        isCollapsed ? "justify-center px-0" : "px-3",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-background hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                          isCollapsed
                            ? "pointer-events-none w-0 -translate-x-2 opacity-0"
                            : "w-auto translate-x-0 opacity-100",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <SidebarMenuItem key={item.to}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={item.label}
                            >
                              {itemLink}
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={16}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        {itemLink}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton disabled tooltip="Users (coming soon)">
                    <Users className="size-[18px]" />
                    <span
                      className={cn(
                        "text-sm font-semibold transition-all duration-300 whitespace-nowrap",
                        isCollapsed
                          ? "pointer-events-none w-0 -translate-x-2 opacity-0"
                          : "w-auto translate-x-0 opacity-100",
                      )}
                    >
                      Users
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
