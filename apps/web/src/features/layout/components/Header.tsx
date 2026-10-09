// Header: sticky top nav with streak/XP badges and animated active indicator.
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { Flame } from "lucide-react";
import { adminNavItem, isNavItemActive, navItems } from "../constants.ts";
import { useIsAdmin } from "../hooks/useIsAdmin.ts";

function NavItem({
  to,
  label,
  icon: Icon,
  isActive,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex h-full items-center gap-2 text-base font-medium transition-colors ${
        isActive ? "text-primary hover:text-primary" : "text-muted hover:text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
      <motion.div
        className="absolute bottom-0 left-0 w-full bg-primary origin-bottom"
        initial={false}
        animate={{
          height: isActive ? 2 : isHovered ? 2 : 0.5,
          scaleY: isActive ? 1 : isHovered ? 1 : 0.25,
          opacity: isActive ? 1 : isHovered ? 0.5 : 0,
        }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </Link>
  );
}

export default function Header() {
  const location = useLocation();
  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);
  const isAdmin = useIsAdmin();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="flex h-16 items-center gap-3 px-4 md:gap-8 md:px-16">
        <Link to="/" className="flex items-center no-underline">
          <img
            src="/assets/horizontal_logo_dark.svg"
            alt="Verselab"
            className="h-8 w-auto dark:hidden"
          />
          <img
            src="/assets/horizontal_logo_light.svg"
            alt="Verselab"
            className="hidden h-8 w-auto dark:block"
          />
        </Link>

        <div className="hidden h-full items-center gap-6 md:flex md:gap-8">
          {navItems.map(({ to, label, icon }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              isActive={isNavItemActive(to, location.pathname)}
            />
          ))}
          {isAdmin && (
            <NavItem
              {...adminNavItem}
              isActive={isNavItemActive(adminNavItem.to, location.pathname)}
            />
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1.5 text-sm font-semibold text-foreground md:px-4 md:py-2 md:text-base">
            <span>{streak}</span>
            <Flame className="h-5 w-5 fill-fire text-fire" />
          </div>

          <div className="hidden items-center gap-1.5 rounded-full border-2 border-border px-3 py-1.5 text-sm font-semibold text-foreground sm:flex md:px-4 md:py-2 md:text-base">
            <span>{xp}</span>
            <span className="text-sm font-bold text-muted">XP</span>
          </div>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
