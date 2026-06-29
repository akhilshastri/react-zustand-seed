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
