import { z } from 'zod'

import { roleSchema } from '@/domain/rbac'

/**
 * The `User` model — a shared, API-contract concept, so it lives in `domain/` (plan §3). Reused
 * by auth (session user), the users feature, RHF forms, and API response parsing.
 */
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.email(),
  roles: z.array(roleSchema),
})

export type User = z.infer<typeof userSchema>

/**
 * Create/edit form input — validates the form (RHF) and the request body (plan §4.4). A single
 * primary `role` keeps the form simple; the backend stores it as the `roles` array.
 */
export const userInputSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.email('Enter a valid email'),
  role: roleSchema,
})

export type UserInput = z.infer<typeof userInputSchema>
