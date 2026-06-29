import { Link, Outlet } from 'react-router'

import { Can, useAuth, useLogout } from '@/features/auth'
import { env } from '@/shared/config/env'
import { paths } from '@/shared/config/paths'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

/**
 * App shell — persistent chrome around the routed `<Outlet/>` (plan §4.3). Nav links and the
 * sign-out control reflect the current session; the admin link is `<Can>`-gated to demonstrate
 * role-based UI hiding (UX-only — the route guard and API enforce it too).
 */
export const RootLayout = () => {
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to={paths.home} className="font-semibold">
              {env.VITE_APP_NAME}
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link to={paths.home} className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Can permission="users:delete">
                <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
              </Can>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-muted-foreground text-sm">{user.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  Sign out
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
