# 10 — Auth & RBAC

Goal: protect routes and gate UI by role. The seed ships custom-JWT auth + a role/permission
model. The rule that governs everything here: **client-side gating is UX only — the API is the
real authority** and returns `403` (guide 05).

## The model: roles → permissions

`src/domain/rbac/rbac.ts` is the single source of truth — a matrix mapping roles to permissions,
framework-agnostic and mirrored by the MSW backend:

```ts
export const ROLES = ['admin', 'manager', 'viewer'] as const
export const PERMISSIONS = ['users:read', 'users:create', 'users:update', 'users:delete'] as const

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['users:read', 'users:create', 'users:update', 'users:delete'],
  manager: ['users:read', 'users:create', 'users:update'],
  viewer: ['users:read'],
}

export const hasPermission = (roles, permission) => /* any role grants it? */
```

Add a capability by extending `PERMISSIONS` and the matrix — then enforce it in the handler
(guide 05) and gate it in the UI below.

## Read the session: `useAuth`

```ts
const { user, isAuthenticated, isPending } = useAuth()
```

`isPending` means the cold-start refresh is still in flight (status `unknown`) — show a loader
rather than flashing the login page. `user` is the persisted session user (id, name, roles).

## Gate UI: `usePermissions` + `<Can>`

```tsx
const { has, all } = usePermissions()
has('users:delete') // boolean, derived from the user's roles

<Can permission="users:create">
  <Button onClick={openCreate}>New user</Button>
</Can>
```

`<Can>` renders its children only if the permission is held (with an optional `fallback`). Use it
to hide buttons, links, and columns — the `RootLayout` nav hides the Users/Admin links this way.

## Gate routes: `ProtectedRoute` + `RequireRole`

Two route guards in `src/app/router/guards.tsx`:

- **`<ProtectedRoute>`** — the authentication gate. Unauthenticated users are redirected to
  `/login` (remembering where they came from); while `isPending`, it shows a full-screen loader.
- **`<RequireRole permission="…">`** — the authorization gate. Used as a route element with
  children, it bounces users who lack the permission back home:

```tsx
{
  path: 'users',
  element: <RequireRole permission="users:read" />,
  children: [{ index: true, lazy: async () => ({ Component: (await import('@/features/users')).UsersPage }) }],
}
```

Wrapping a feature route this way is how you'd protect the `invoices` page from guide 04 (see
guide 12 for the full router picture).

## Why the access token lives in memory

The seed teaches secure-by-default token handling (`auth-store.ts` + `shared/api`):

- **Access token → memory only** (`setAccessToken`), never localStorage — so XSS can't read it.
- **Refresh token → httpOnly cookie** (MSW-simulated); JavaScript never touches it.
- **Persisted:** only the non-sensitive `user` (for instant UI on reload). **Not** the token, and
  **not** `status` — a cold start is always re-validated by a silent refresh.
- **401 handling:** a single-flight refresh retries the request once (guide 15).

(See [ADR-0005](../adr/0005-auth-security-defaults.md).)

> **Rules in play:** `<Can>` / `<RequireRole>` hide UI; they are **not** security. Every protected
> endpoint must enforce authorization server-side (`403`). Keep the role→permission matrix and the
> handler checks in sync. ([`AGENTS.md`](../../AGENTS.md) §10.)

---

**Next →** [11 — Cross-Store Reactions](./11-cross-store-reactions.md)
