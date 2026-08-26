// Layout constants: shared navigation items for the header bar.
import { Home, BookOpen, User, LayoutDashboard } from "lucide-react";

export const navItems = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/about", label: "Materi", icon: BookOpen },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/admin", label: "Konten", icon: LayoutDashboard },
] as const;
