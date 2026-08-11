import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import ThemeToggle from './ThemeToggle'
import { Flame } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-header-bg backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">
            V
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Verselab
          </span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 pb-1 text-sm font-semibold sm:order-0 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Courses
          </Link>
          <a
            href="https://docs.verselab.id"
            className="nav-link"
            target="_blank"
            rel="noreferrer"
          >
            About
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground sm:flex">
            <Flame className="h-4 w-4 text-primary" />
            <span>0</span>
          </div>
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
