import { Link, Outlet } from 'react-router'

import { paths } from '@/app/router/paths'
import { env } from '@/shared/config/env'

/**
 * App shell — persistent chrome (header/nav) wrapping the routed `<Outlet/>`. Auth-aware
 * layouts (AuthLayout vs DashboardLayout), the sidebar, and a theme toggle arrive with the
 * auth feature in Phase 2 (plan §4.3).
 */
export const RootLayout = () => (
  <div className="min-h-dvh">
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to={paths.home} className="font-semibold">
          {env.VITE_APP_NAME}
        </Link>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Outlet />
    </main>
  </div>
)
