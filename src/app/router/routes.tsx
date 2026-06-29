import { createBrowserRouter } from 'react-router'

import { NotFoundPage } from '@/app/error/not-found-page'
import { RouteErrorBoundary } from '@/app/error/route-error-boundary'
import { RootLayout } from '@/app/layouts/root-layout'

import { paths } from './paths'

/**
 * Data-mode router (plan §4.3). Feature pages are code-split via `lazy` and loaded through
 * their public `index.ts`, so the route layer respects the FSD boundary (app → features).
 * Route guards (`<ProtectedRoute>` / `<RequireRole>`) wrap protected branches in Phase 2.
 */
export const router = createBrowserRouter([
  {
    path: paths.home,
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/features/home')
          return { Component: HomePage }
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
