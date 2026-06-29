import { z } from 'zod'

import { userSchema } from '@/domain/user'

/** Login form input — validates the form (RHF) and the request body (plan §4.4 / §4.6). */
export const loginCredentialsSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>

/**
 * Non-sensitive session user — what the persisted auth slice may hold for instant UI. It is the
 * full `User` minus secrets (there are no secrets on `User`; the access token lives in memory
 * only and the refresh token is an httpOnly cookie — plan §4.6).
 */
export const sessionUserSchema = userSchema
export type SessionUser = z.infer<typeof sessionUserSchema>

/** Shape returned by `/auth/login` and `/auth/refresh`. */
export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: userSchema,
})
export type AuthResponse = z.infer<typeof authResponseSchema>

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'
