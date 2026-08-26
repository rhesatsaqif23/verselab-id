// Header: sticky top nav with streak/XP badges and animated active indicator.
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useProgressStore } from "#/engine/progress/progressStore.ts";
import { Flame } from "lucide-react";
import { navItems } from "../constants.ts";

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
  const isActive = (path: string) => location.pathname === path;
  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="page-wrap flex h-16 items-center gap-8 px-6">
        <Link to="/home" className="flex items-center gap-2 no-underline">
          <span className="text-3xl font-bold tracking-tight text-foreground">Verselab</span>
        </Link>

        <div className="flex h-full items-center gap-8">
          {navItems.map(({ to, label, icon }) => (
            <NavItem key={to} to={to} label={label} icon={icon} isActive={isActive(to)} />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>{streak}</span>
            <Flame className="h-5 w-5 fill-fire text-fire" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>{xp}</span>
            <span className="text-sm font-bold text-muted">XP</span>
          </div>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
