import { Link, useLocation } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { Flame, User, Home, BookOpen } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const streak = useProgressStore((s) => s.streak)
  const xp = useProgressStore((s) => s.xp)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="page-wrap flex items-center gap-8 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            Verselab
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`group relative flex items-center gap-2 text-base font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
          >
            <Home className="h-5 w-5" />
            Beranda
            {isActive('/') && (
              <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>

          <Link
            to="/about"
            className={`group relative flex items-center gap-2 text-base font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
          >
            <BookOpen className="h-5 w-5" />
            Materi
            {isActive('/about') && (
              <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>

          <Link
            to="/profile"
            className={`group relative flex items-center gap-2 text-base font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
          >
            <User className="h-5 w-5" />
            Profil
            {isActive('/profile') && (
              <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>{streak}</span>
            <Flame className="h-5 w-5 text-secondary" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>{xp}</span>
            <span className="text-sm font-bold text-muted">XP</span>
          </div>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
