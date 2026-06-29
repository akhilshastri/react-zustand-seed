import { useMutation } from '@tanstack/react-query'

import { http } from '@/shared/api'

import { useAuthStore } from '../store/auth-store'

/**
 * Log out. Clears the session locally even if the network call fails — the user's intent is to
 * end the session. The query-cache clear, UI reset, and redirect happen reactively in
 * `app/bindings.ts` when status flips to `unauthenticated` (plan §4.9).
 */
export const useLogout = () =>
  useMutation({
    mutationFn: () => http.post<void>('/auth/logout'),
    onSettled: () => {
      useAuthStore.getState().clearSession()
    },
  })
