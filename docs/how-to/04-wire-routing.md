# 04 — Wire Routing

Goal: make the feature reachable. This is the one manual step the generator left for you. After
it, navigating to `/invoices` renders your page end-to-end (with mock data from the generated
handler).

The router is **data mode** React Router v8 and lives in `src/app/router/routes.tsx`. Everything
except `/login` sits behind `<ProtectedRoute>` → `<RootLayout>`. Feature pages are **code-split**
with `lazy` and loaded through their public `index.ts`.

## Step 1 — Add a typed path

Route strings live in **one** place: `src/shared/config/paths.ts`. It's in `shared/` (not `app/`)
so features can navigate by constant without importing the app layer. Add your route:

```ts
export const paths = {
  home: '/',
  login: '/login',
  users: '/users',
  invoices: '/invoices',
} as const
```

## Step 2 — Add the route module

Open `src/app/router/routes.tsx` and add a child under `RootLayout`, alongside the existing
pages. For a plain (non-role-gated) page, lazy-load it through the barrel:

```tsx
{
  path: 'invoices',
  lazy: async () => ({ Component: (await import('@/features/invoices')).InvoicesPage }),
},
```

Place it **before** the `{ path: '*', element: <NotFoundPage /> }` catch-all. The `lazy` form
keeps the feature out of the initial bundle — it loads on first navigation.

> To gate the page behind a permission, wrap it the way `users` is — see guide 10. For now we
> leave it open to any signed-in user.

## Step 3 — Navigate to it

Use the typed constant, never a raw string. To add a nav link, edit
`src/app/layouts/root-layout.tsx`:

```tsx
import { paths } from '@/shared/config/paths'

;<Link to={paths.invoices} className="text-muted-foreground hover:text-foreground">
  Invoices
</Link>
```

Programmatic navigation uses the same constants:

```tsx
import { useNavigate } from 'react-router'

const navigate = useNavigate()
navigate(paths.invoices)
```

## Verify

With `npm run dev` running, sign in and open `http://localhost:5173/invoices`. You should see the
page render the two placeholder rows from the generated handler. The full chain now works:

```
route → lazy page → useInvoicesList → http.get('/invoices') → MSW handler → rows on screen
```

> **Rules in play:** import from **`react-router`**, never `react-router-dom`. Navigate via
> `paths.ts`, not raw strings. Data fetching stays in TanStack Query — **not** router loaders
> (loaders may only do auth/prefetch via `queryClient.ensureQueryData`; see guide 12).
> ([`AGENTS.md`](../../AGENTS.md) §7.)

---

**Next →** [05 — Mock the Backend](./05-mock-the-backend.md)
