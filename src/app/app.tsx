import { RouterProvider } from 'react-router'

import { ThemeProvider } from '@/app/providers/theme-provider'
import { router } from '@/app/router/routes'

// Phase 1: themed + routed shell. The full provider stack (QueryProvider, root error boundary)
// and cross-store bindings are composed in the acceptance increment via app/providers.
export const App = () => (
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
)
