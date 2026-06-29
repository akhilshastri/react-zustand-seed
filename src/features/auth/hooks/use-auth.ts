import type { AuthStatus, SessionUser } from '@/domain/auth'

import { useAuthStore } from '../store/auth-store'

export interface Auth {
  status: AuthStatus
  user: SessionUser | null
  isAuthenticated: boolean
  /** Bootstrap refresh still in flight — status not yet known (avoid flashing the login page). */
  isPending: boolean
}

/** Read-only view of the current session for components. */
export const useAuth = (): Auth => {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  return {
    status,
    user,
    isAuthenticated: status === 'authenticated',
    isPending: status === 'unknown',
  }
}
