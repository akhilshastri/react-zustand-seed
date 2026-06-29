import { type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { type Permission } from '@/domain/rbac'
import { useAuth, usePermissions } from '@/features/auth'
import { paths } from '@/shared/config/paths'

const FullScreenLoader = () => (
  <div className="text-muted-foreground grid min-h-dvh place-items-center text-sm">Loading…</div>
)

/**
 * Gate a branch behind authentication (plan §4.3). While the bootstrap refresh is pending the
 * status is `unknown`, so we show a loader rather than flashing the login page.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isPending } = useAuth()
  const location = useLocation()
  if (isPending) return <FullScreenLoader />
  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

interface RequireRoleProps {
  permission: Permission
  children?: ReactNode
}

/**
 * Gate a branch or element behind a permission. Client UX-only (the API enforces too, §4.6);
 * unauthorized users are bounced home. Used as a route element (renders `<Outlet/>`) or inline
 * wrapping children.
 */
export const RequireRole = ({ permission, children }: RequireRoleProps) => {
  const { has } = usePermissions()
  if (!has(permission)) return <Navigate to={paths.home} replace />
  return children ?? <Outlet />
}
