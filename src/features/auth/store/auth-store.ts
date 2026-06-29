import type { AuthStatus, SessionUser } from '@/domain/auth'
import { clearAccessToken, setAccessToken } from '@/shared/api'
import { createPersistedStore, type PersistedStoreInitializer } from '@/shared/store'

export interface AuthState {
  status: AuthStatus
  user: SessionUser | null
  /** Store the session: access token → memory (never persisted), user → state. */
  setSession: (user: SessionUser, accessToken: string) => void
  /** End the session: clear the in-memory token, user, and mark unauthenticated. */
  clearSession: () => void
  setStatus: (status: AuthStatus) => void
}

const initializer: PersistedStoreInitializer<AuthState> = (set) => ({
  status: 'unknown',
  user: null,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken)
    set(
      (s) => {
        s.status = 'authenticated'
        s.user = user
      },
      false,
      'auth/setSession',
    )
  },
  clearSession: () => {
    clearAccessToken()
    set(
      (s) => {
        s.status = 'unauthenticated'
        s.user = null
      },
      false,
      'auth/clearSession',
    )
  },
  setStatus: (status) =>
    set(
      (s) => {
        s.status = status
      },
      false,
      'auth/setStatus',
    ),
})

// Persisted: only the non-sensitive `user` (id, name, roles) for instant UI on reload — never
// the access token (in memory) nor the refresh token (httpOnly cookie). `status` is NOT
// persisted: a cold start is always re-validated by a silent refresh (plan §4.6).
export const useAuthStore = createPersistedStore<AuthState, Pick<AuthState, 'user'>>(
  'auth',
  initializer,
  { partialize: (state) => ({ user: state.user }) },
)
