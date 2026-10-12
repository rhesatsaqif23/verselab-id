// BottomNav: mobile-only primary navigation. The desktop header drops its
// nav row below md, so the same items move here to stay one thumb-tap away.
// Flex, not a fixed grid, so adding the Admin entry never shifts a layout.
import { Link, useLocation } from "@tanstack/react-router";
import { adminNavItem, isNavItemActive, navItems } from "../constants.ts";
import { useIsAdmin } from "../hooks/useIsAdmin.ts";

export default function BottomNav() {
  const location = useLocation();
  const isAdmin = useIsAdmin();
  const items = isAdmin ? [...navItems, adminNavItem] : navItems;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {items.map(({ to, label, icon: Icon }) => {
        const isActive = isNavItemActive(to, location.pathname);
        return (
          <Link
            key={to}
            to={to}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-1 pt-2 text-[11px] font-medium transition-colors ${
              isActive ? "text-primary" : "text-muted hover:text-primary"
            }`}
          >
            {isActive && (
              <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />
            )}
            <Icon className="size-6" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
