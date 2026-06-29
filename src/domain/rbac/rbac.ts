import { z } from 'zod'

/**
 * Role-based access control model (plan §4.6). Roles and permissions are framework-agnostic
 * domain types; the role → permission matrix is the single source of truth, used by the client
 * (UX-only gating) AND mirrored by the MSW backend (real `403` enforcement).
 */
export const ROLES = ['admin', 'manager', 'viewer'] as const
export const roleSchema = z.enum(ROLES)
export type Role = z.infer<typeof roleSchema>

export const PERMISSIONS = ['users:read', 'users:create', 'users:update', 'users:delete'] as const
export type Permission = (typeof PERMISSIONS)[number]

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['users:read', 'users:create', 'users:update', 'users:delete'],
  manager: ['users:read', 'users:create', 'users:update'],
  viewer: ['users:read'],
}

/** The full permission set granted by a collection of roles. */
export const permissionsForRoles = (roles: readonly Role[]): Set<Permission> => {
  const granted = new Set<Permission>()
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role]) granted.add(permission)
  }
  return granted
}

/** Whether any of the given roles grants `permission`. */
export const hasPermission = (roles: readonly Role[], permission: Permission): boolean =>
  roles.some((role) => ROLE_PERMISSIONS[role].includes(permission))
