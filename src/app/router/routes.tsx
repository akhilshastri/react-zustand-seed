import { createBrowserRouter } from 'react-router'

import { NotFoundPage } from '@/app/error/not-found-page'
import { RouteErrorBoundary } from '@/app/error/route-error-boundary'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { RootLayout } from '@/app/layouts/root-layout'
import { LoginPage } from '@/features/auth'
import { paths } from '@/shared/config/paths'

import { ProtectedRoute, RequireRole } from './guards'

/**
 * Data-mode router (plan §4.3). Public `/login` sits outside the auth gate; everything else is
 * wrapped by `<ProtectedRoute>` (pathless layout route) → `<RootLayout>`. Feature pages are
 * code-split via `lazy` and loaded through their public `index.ts` (respects app → features).
 */
export const router = createBrowserRouter([
  {
    path: paths.login,
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: paths.home,
        element: <RootLayout />,
        children: [
          {
            index: true,
            lazy: async () => ({ Component: (await import('@/features/home')).HomePage }),
          },
          {
            path: 'admin',
            element: <RequireRole permission="users:delete" />,
            children: [
              {
                index: true,
                lazy: async () => ({ Component: (await import('@/features/admin')).AdminPage }),
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
