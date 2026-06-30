# 12 — Advanced Routing

Goal: go beyond "add a route" (guide 04) to the full data-router toolkit — nested layouts, pathless
guard routes, code-splitting, role-gated branches, parameterized paths, and error handling. The
router lives in `src/app/router/routes.tsx` and uses **React Router v8 data mode**.

## The tree, top to bottom

```
createBrowserRouter([
  { path: '/login', element: <AuthLayout/>, children: [ <LoginPage/> ] },   // public
  { element: <ProtectedRoute/>, children: [                                  // pathless auth gate
    { path: '/', element: <RootLayout/>, children: [                         // app shell + <Outlet/>
      { index: true, lazy: …HomePage },
      { path: 'users',  element: <RequireRole permission="users:read"/>, children: [ …UsersPage ] },
      { path: 'admin',  element: <RequireRole permission="users:delete"/>, children: [ …AdminPage ] },
      { path: '*', element: <NotFoundPage/> },
    ]},
  ]},
])
```

Two layout ideas to reuse:

- **Nested layouts.** `AuthLayout` (centered, chrome-free) wraps login; `RootLayout` (header, nav,
  theme toggle) wraps the app. Each renders an `<Outlet/>` where children appear.
- **Pathless layout routes.** `ProtectedRoute` has **no `path`** — it's a wrapper that runs the
  auth gate and renders `<Outlet/>`. Use pathless routes to apply a guard or layout to a whole
  branch without adding a URL segment.

## Code-split every feature page

Load feature pages with `lazy` through their public `index.ts`, so each lands in its own chunk:

```tsx
{ index: true, lazy: async () => ({ Component: (await import('@/features/home')).HomePage }) }
```

## Role-gated branches

Nest the page under a `<RequireRole>` element (guide 10). The guard renders `<Outlet/>` when
allowed and redirects otherwise — so the whole branch is protected by one line.

## Parameterized routes + a typed builder

Detail routes take params. Keep the URL shape in `paths.ts` with a **builder**, so callers never
hand-format strings:

```ts
// shared/config/paths.ts
export const paths = {
  // …
  invoices: '/invoices',
  invoice: (id: string) => `/invoices/${id}` as const,
} as const
```

```tsx
// routes.tsx — a child of the invoices branch
{ path: 'invoices/:id', lazy: async () => ({ Component: (await import('@/features/invoices')).InvoiceDetailPage }) }

// navigate / read
navigate(paths.invoice(inv.id))
const { id } = useParams()
```

## Error handling & 404

- **`errorElement: <RouteErrorBoundary/>`** catches loader/render errors for a branch and shows a
  recoverable screen (it distinguishes `isRouteErrorResponse` from thrown `Error`s). A second,
  app-level `react-error-boundary` wraps the whole tree in `app-providers`.
- **`{ path: '*', element: <NotFoundPage/> }`** is the catch-all 404 — keep it last in the branch.

## Loaders: auth/prefetch only — not data fetching

This is the rule that trips people up. **Data fetching stays in TanStack Query** (guide 07), not
in router loaders. A loader may only do auth checks or _prefetch_ via
`queryClient.ensureQueryData` so the cache is warm when the component reads it with `useQuery`. Do
not return route data the component then re-fetches.

> **Rules in play:** import from **`react-router`** (not `react-router-dom`); navigate via typed
> `paths.ts`; loaders do auth/prefetch only. ([`AGENTS.md`](../../AGENTS.md) §7.)

---

**Next →** [13 — Theming & the PWA Shell](./13-theming-and-pwa.md)
