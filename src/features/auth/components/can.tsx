import { type ReactNode } from 'react'

import { type Permission } from '@/domain/rbac'

import { usePermissions } from '../hooks/use-permissions'

interface CanProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Render `children` only when the current user holds `permission` (plan §4.6). UX-only: hiding a
 * control is not security — the API is the authority — so never rely on `<Can>` to protect data.
 */
export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const { has } = usePermissions()
  return has(permission) ? children : fallback
}
