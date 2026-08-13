import { Link, useLocation } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { Flame, Zap, Menu, Home, BookOpen } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

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
            Home
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
            Courses
            {isActive('/about') && (
              <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-primary" />
            )}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>2</span>
            <Flame className="h-5 w-5 text-secondary" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border-2 border-border px-4 py-2 text-base font-semibold text-foreground">
            <span>0</span>
            <Zap className="h-5 w-5 text-border" />
          </div>

          <ThemeToggle />

          <button className="p-2 text-muted hover:text-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </header>
  )
}
