import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-semibold text-primary">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:bg-muted"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/demo/better-auth"
      className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:bg-muted"
    >
      Sign in
    </Link>
  )
}
