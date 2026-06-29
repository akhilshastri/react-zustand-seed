import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, type ReactNode } from 'react'

import { createQueryClient } from '@/shared/api'

/**
 * The app-wide `QueryClient`. A module singleton so `app/bindings.ts` can reference the same
 * instance for cache teardown on logout (plan §4.9); the `createQueryClient` factory stays for
 * tests, which want isolated caches.
 */
export const queryClient = createQueryClient()

// Dev-only devtools. Guarding the dynamic import behind a static DEV check lets Rolldown drop
// it from the production bundle entirely (plan §4.2).
const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : null

export const QueryProvider = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    {Devtools ? (
      <Suspense>
        <Devtools initialIsOpen={false} />
      </Suspense>
    ) : null}
  </QueryClientProvider>
)
