import type { AuthResponse } from '@/domain/auth'
import { http, runRefresh, setRefreshHandler } from '@/shared/api'

import { useAuthStore } from '../store/auth-store'

/**
 * Recover a 401 by exchanging the httpOnly refresh cookie for a fresh access token (plan §4.6).
 * `skipAuthRefresh` keeps this call from recursing through the 401 handler. Returns whether the
 * session was restored.
 */
export const authRefreshHandler = async (): Promise<boolean> => {
  try {
    const { user, accessToken } = await http.post<AuthResponse>('/auth/refresh', undefined, {
      skipAuthRefresh: true,
    })
    useAuthStore.getState().setSession(user, accessToken)
    return true
  } catch {
    useAuthStore.getState().clearSession()
    return false
  }
}

/** Register 401 recovery with the http-client. Call once at bootstrap (from app/bindings). */
export const registerAuthRefresh = (): void => setRefreshHandler(authRefreshHandler)

/**
 * Restore the session on cold start via the refresh cookie, resolving the initial `unknown`
 * status. Goes through the single-flight `runRefresh` so it shares one attempt with any
 * concurrent 401. Requires `registerAuthRefresh()` to have run first.
 */
export const bootstrapAuth = async (): Promise<void> => {
  const restored = await runRefresh()
  if (!restored) useAuthStore.getState().setStatus('unauthenticated')
}
