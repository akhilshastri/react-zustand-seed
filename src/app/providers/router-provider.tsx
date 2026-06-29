import { RouterProvider as ReactRouterProvider } from 'react-router'

import { router } from '@/app/router/routes'

/** Thin wrapper mounting the data-mode router as the routing root (plan §4.3). */
export const RouterProvider = () => <ReactRouterProvider router={router} />
