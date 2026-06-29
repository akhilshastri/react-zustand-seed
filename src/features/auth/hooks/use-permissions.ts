import { useMemo } from 'react'

import { hasPermission, permissionsForRoles, type Permission } from '@/domain/rbac'

import { useAuthStore } from '../store/auth-store'

export interface Permissions {
  has: (permission: Permission) => boolean
  all: Set<Permission>
}

/**
 * Permissions derived from the current user's roles (plan §4.6). Client-side and UX-only — it
 * decides what to *show*; the MSW backend still enforces authorization with 403s.
 */
export const usePermissions = (): Permissions => {
  const roles = useAuthStore((s) => s.user?.roles)
  return useMemo(() => {
    const userRoles = roles ?? []
    return {
      has: (permission: Permission) => hasPermission(userRoles, permission),
      all: permissionsForRoles(userRoles),
    }
  }, [roles])
}
