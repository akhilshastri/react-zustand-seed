import { useMutation } from '@tanstack/react-query'

import type { AuthResponse, LoginCredentials } from '@/domain/auth'
import { http } from '@/shared/api'

import { useAuthStore } from '../store/auth-store'

/** Log in against the MSW backend; on success, store the session (plan §4.6). */
export const useLogin = () =>
  useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      http.post<AuthResponse>('/auth/login', credentials),
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setSession(user, accessToken)
    },
  })
