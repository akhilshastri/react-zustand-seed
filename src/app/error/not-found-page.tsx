import { Link } from 'react-router'

import { paths } from '@/shared/config/paths'
import { Button } from '@/shared/ui/button'

/** Catch-all 404 page rendered by the `*` route (plan §4.3). */
export const NotFoundPage = () => (
  <div className="space-y-4 py-16 text-center">
    <p className="text-muted-foreground font-mono text-sm">404</p>
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <Button asChild>
      <Link to={paths.home}>Back to home</Link>
    </Button>
  </div>
)
