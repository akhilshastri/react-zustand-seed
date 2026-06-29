import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

import { paths } from '@/app/router/paths'
import { Button } from '@/shared/ui/button'

const describe = (error: unknown): { status: string; message: string } => {
  if (isRouteErrorResponse(error)) {
    return { status: String(error.status), message: error.statusText || 'Unexpected response' }
  }
  if (error instanceof Error) return { status: 'Error', message: error.message }
  return { status: 'Error', message: 'An unexpected error occurred.' }
}

/**
 * Route-level error element: catches loader and render errors per the route tree (plan §4.3).
 * A second, app-level boundary (react-error-boundary) wraps the whole tree in app-providers.
 */
export const RouteErrorBoundary = () => {
  const { status, message } = describe(useRouteError())
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground font-mono text-sm">{status}</p>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link to={paths.home}>Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
