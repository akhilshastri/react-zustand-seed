import { type FallbackProps } from 'react-error-boundary'

import { Button } from '@/shared/ui/button'

/**
 * App-level error boundary fallback (outside the router) for failures the per-route
 * `errorElement` can't catch — e.g. a provider or render error above the route tree (plan §4.3).
 */
export const RootErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className="grid min-h-dvh place-items-center p-6">
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Application error</h1>
      <p className="text-muted-foreground">
        {error instanceof Error ? error.message : 'An unexpected error occurred.'}
      </p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  </div>
)
