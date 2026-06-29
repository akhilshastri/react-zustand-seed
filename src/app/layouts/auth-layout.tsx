import { Outlet } from 'react-router'

/** Centered, chrome-free layout for unauthenticated pages (login). */
export const AuthLayout = () => (
  <div className="grid min-h-dvh place-items-center p-6">
    <Outlet />
  </div>
)
