import { createQueryKeys } from '@/shared/api'

/** Query-key factory for the users resource (plan §4.2). Invalidate `userKeys.all` after writes. */
export const userKeys = createQueryKeys('users')

export interface UsersListParams {
  q: string
  sortBy: 'name' | 'email'
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}
