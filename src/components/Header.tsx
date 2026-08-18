import { Link, useLocation } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { useProgressStore } from '#/engine/progress/progressStore.ts'
import { Flame, User, Home, BookOpen } from 'lucide-react'

const navItems = [
  { to: '/home', label: 'Beranda', icon: Home },
  { to: '/about', label: 'Materi', icon: BookOpen },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function Header() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const streak = useProgressStore((s) => s.streak)
  const xp = useProgressStore((s) => s.xp)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <nav className="page-wrap flex h-16 items-center gap-8 px-6">
        <Link to="/home" className="flex items-center gap-2 no-underline">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            Verselab
          </span>
        </Link>

        <div className="flex h-full items-center gap-8">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className={`group relative flex h-full items-center gap-2 text-base font-medium transition-colors ${active ? 'text-primary' : 'text-muted hover:text-primary'
                  }`}
              >
                <Icon className="h-5 w-5" />
                {label}
                <div
                  className={`absolute bottom-0 left-0 h-0.5 w-full transition-opacity duration-150 ${active
                      ? 'bg-primary opacity-100'
                      : 'bg-primary opacity-0 group-hover:opacity-50'
                    }`}
                />
              </Link>
            )
          })}
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

