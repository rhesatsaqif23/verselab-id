// Layout constants: shared navigation items for the header bar and the
// mobile tab bar. Both surfaces render the same list, so the Admin item and
// the active-route rule live here rather than being duplicated per surface.
import { BookOpen, Home, ShieldCheck, User } from "lucide-react";

export const navItems = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/material", label: "Materi", icon: BookOpen },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export const adminNavItem = { to: "/admin", label: "Admin", icon: ShieldCheck } as const;

/** The Admin entry covers its whole subtree; every other item is exact-match. */
export function isNavItemActive(to: string, pathname: string): boolean {
  return to === "/admin" ? pathname.startsWith(to) : pathname === to;
}
