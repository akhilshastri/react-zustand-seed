import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { setupBindings } from '@/app/bindings'
import { RootErrorFallback } from '@/app/error/root-error-fallback'
import { bootstrapAuth } from '@/features/auth'

import { QueryProvider } from './query-provider'
import { RouterProvider } from './router-provider'
import { ThemeProvider } from './theme-provider'

// Wire cross-store reactions once, before first render (plan §4.9). Module-level so it runs
// exactly once on import, independent of React StrictMode's double-invoked effects.
setupBindings()

// Cold-start session restore runs once after render (not at module-eval): render is gated on
// MSW being ready in main.tsx, so the refresh call reaches the mock backend. Module-level guard
// keeps it single even across StrictMode's double-invoked effects.
let bootstrapped = false

/**
 * Composition root — assembles every provider in the correct order (plan §3, §4):
 * a top-level error boundary wraps theming, server-state, then the router.
 */
export const AppProviders = () => {
  useEffect(() => {
    if (bootstrapped) return
    bootstrapped = true
    void bootstrapAuth()
  }, [])

  return (
    <ErrorBoundary FallbackComponent={RootErrorFallback}>
      <ThemeProvider>
        <QueryProvider>
          <RouterProvider />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
