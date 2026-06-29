import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { User } from '@/domain/user'
import { http } from '@/shared/api'

import { userKeys, type UsersListParams } from './users-keys'

interface UsersListResponse {
  rows: User[]
  total: number
}

/**
 * Server-driven users list (plan §4.5). Filter/sort/page are part of the query key, so each
 * combination is cached independently; `keepPreviousData` keeps the current rows on screen while
 * the next page loads (no flicker).
 */
export const useUsersQuery = (params: UsersListParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => {
      const search = new URLSearchParams({
        q: params.q,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        page: String(params.page),
        pageSize: String(params.pageSize),
      })
      return http.get<UsersListResponse>(`/users?${search.toString()}`)
    },
    placeholderData: keepPreviousData,
  })
