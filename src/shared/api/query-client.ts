import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { ApiError } from './api-error'

// Smart retry: never retry client errors (4xx are caller bugs, not transient) — retry other
// failures up to twice. See plan §4.2.
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

// Central error sink for every query and mutation. Phase 1 logs in dev; Phase 2 routes 401 →
// auth refresh/logout and raises a toast (plan §4.2). Centralizing it keeps individual hooks
// free of boilerplate transport-error handling.
const onError = (error: unknown): void => {
  if (import.meta.env.DEV) console.error('[query]', error)
}

/** Fresh `QueryClient` with enterprise defaults. A factory so tests get isolated caches. */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
