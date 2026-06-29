# Enterprise React App — Build Plan

**Status:** Draft for approval · **Date:** 2026-06-28 · **No code written yet.**

A greenfield, enterprise-grade React SPA built on **Node.js + Vite**, with **React Compiler**
enabled, Zustand (client state), TanStack Query (server state), TanStack Table + Virtual
(data grid), React Router v8 (library/data mode), and React Hook Form + Zod (forms).
It is an installable **PWA** (app-shell) and keeps cross-store communication explicit via
**direct bindings** in one place (`app/bindings.ts`) — no event bus. Includes a code
**scaffolder** (Plop) for domain types, features, and mock handlers.

API is **REST, mocked entirely with MSW** (no real backend). Auth is **custom JWT**.
Single app, **no CI**, **no deployment** — `npm run build` just produces `dist/`.
**No Storybook.**

---

## 1. Decisions (confirmed)

| Area | Choice |
|------|--------|
| Runtime / package manager | **Node.js + npm** (no bun) |
| Compiler | **React Compiler 1.0** enabled via Babel (see §4.7) |
| UI layer | **shadcn/ui** — Tailwind CSS v4 + Radix primitives, components copied into `src/shared/ui` |
| Router mode | **React Router v8 — Library / Data mode** (`createBrowserRouter`), SPA, no SSR |
| Data fetching | **TanStack Query owns server state**; React Router used for navigation + guards |
| Client state | **Zustand** for UI/session/client state only |
| Cross-store comms | **Direct bindings** in `app/bindings.ts` (`store.subscribe` + direct calls); no event bus, no store↔store imports (§4.9) |
| PWA | **vite-plugin-pwa** (Workbox `generateSW`) — installable + app-shell precache; **no offline data** (data needs a real API) (§4.8) |
| Enterprise scope (day one) | Auth (custom JWT) + protected routes · RBAC/permissions · Theming/dark mode (no i18n) |
| API | **REST, MSW-mocked only** — no real backend; MSW serves dev *and* tests |
| Validation | **Zod v4**, schemas live in `domain/` and are reused by RHF + API parsing |
| Scaffolder | **Plop** generators (`npm run gen`) |
| CI / Deploy | **None.** Build produces `dist/` only. |
| Storybook | **Excluded.** |

### Golden rule of state
- **Server state → TanStack Query** (anything fetched via the REST/MSW layer; cached, refetched, invalidated).
- **Client state → Zustand** (auth/session, theme, sidebar, modals, table filter UI, wizard steps).
- Never mirror server data into Zustand. Components select narrow slices from each.

---

## 2. Dependencies (latest, verified from npm on 2026-06-28)

### Runtime
| Package | Version | Purpose |
|---------|---------|---------|
| react / react-dom | 19.2.7 | UI runtime (React 19 → React Compiler needs no runtime package) |
| react-router | 8.0.1 | Routing (data mode) — the standalone `react-router` package; `react-router-dom` is legacy |
| zustand | 5.0.14 | Client state |
| @tanstack/react-query | 5.101.2 | Server state |
| @tanstack/react-query-devtools | 5.101.2 | Query devtools (dev only) |
| @tanstack/react-table | 8.21.3 | Headless data grid ("TanStack Grid") |
| @tanstack/react-virtual | 3.14.4 | Row virtualization for the grid |
| react-hook-form | 7.80.0 | Forms |
| @hookform/resolvers | 5.4.0 | RHF ↔ Zod bridge |
| zod | 4.4.3 | Schema validation |
| react-error-boundary | latest | Declarative error boundaries |
| clsx + tailwind-merge | latest | `cn()` class composition |
| class-variance-authority | latest | Variant styling (shadcn) |
| lucide-react | latest | Icon set (shadcn default) |

### Build / compiler / styling
| Package | Version | Purpose |
|---------|---------|---------|
| vite | 8.1.0 | Build/dev server (Rolldown-based) |
| @vitejs/plugin-react | 6.0.3 | React + Fast Refresh (oxc/Rust — **no longer runs Babel internally**) |
| @rolldown/plugin-babel | 0.2.3 | Runs Babel passes (React Compiler) since plugin-react v6 dropped Babel |
| babel-plugin-react-compiler | 1.0.0 | **React Compiler** |
| @babel/core | 8.0.1 | Peer dep of the Babel plugin |
| typescript | 6.0.3 | Types (strict) |
| tailwindcss | v4 | Styling (via `@tailwindcss/vite`) |
| vite-tsconfig-paths | latest | Path-alias resolution |

> **Not installed:** `react-compiler-runtime` (only needed for React 17/18 — we are on React 19,
> which ships `react/compiler-runtime` built in).

### PWA
| Package | Version | Purpose |
|---------|---------|---------|
| vite-plugin-pwa | 1.3.0 | Service worker + web manifest (Workbox) |
| workbox-window | 7.4.1 | Client-side SW registration + update prompt |
| @vite-pwa/assets-generator | 1.0.2 | (dev) generate the icon set from one source image |

> **Cross-store comms:** **no dependency** — reactions are wired with Zustand's own
> `store.subscribe` in `app/bindings.ts` (§4.9). No event-bus library.

### Quality / test
| Package | Version | Purpose |
|---------|---------|---------|
| eslint | 10.6.0 | Lint (flat config only) |
| typescript-eslint | 8.62.0 | TS lint rules (meta package) |
| eslint-plugin-react-hooks | latest (`recommended-latest`) | React hooks **+ React Compiler lint rules** |
| eslint-plugin-jsx-a11y / perfectionist | latest | a11y + import ordering |
| prettier + prettier-plugin-tailwindcss | 3.9.1 | Formatting |
| vitest | 4.1.9 | Unit/integration runner |
| @testing-library/react | 16.3.2 | Component testing |
| @testing-library/jest-dom | 6.9.1 | DOM matchers |
| msw | 2.14.6 | **The API** — mocks REST for dev *and* tests |
| @playwright/test | 1.61.1 | E2E |
| husky + lint-staged + commitlint | latest | Pre-commit gates + conventional commits |

> **"TanStack Grid" clarification:** there is no product by that name. The TanStack data
> grid is **TanStack Table v8** (headless) + **TanStack Virtual v3** (virtualization),
> wrapped here as a single reusable `DataGrid` component.

---

## 3. Proposed project structure

Feature-sliced (FSD-lite) + a composition root. Vertical feature slices own their UI,
state, API, and types; cross-cutting building blocks live in `shared/`; framework-agnostic
models live in `domain/`.

```
react-zustand-seed/
├── public/
├── src/
│   ├── app/                          # Composition root (wiring, not features)
│   │   ├── providers/
│   │   │   ├── app-providers.tsx     # composes all providers in correct order
│   │   │   ├── query-provider.tsx    # QueryClientProvider + devtools
│   │   │   ├── router-provider.tsx   # RouterProvider
│   │   │   ├── theme-provider.tsx    # applies theme class from theme-store
│   │   │   └── index.ts
│   │   ├── router/
│   │   │   ├── routes.tsx            # route tree (lazy route modules)
│   │   │   ├── guards.tsx            # <ProtectedRoute>, <RequireRole>
│   │   │   ├── paths.ts             # typed path constants + builders
│   │   │   └── index.ts
│   │   ├── layouts/                  # AppShell, AuthLayout, DashboardLayout
│   │   ├── error/                    # root + per-route error boundaries
│   │   ├── pwa/                      # registerSW + update-prompt toast + offline banner
│   │   ├── bindings.ts              # the ONE place cross-cutting reactions subscribe (app may import features + shared)
│   │   └── app.tsx
│   │
│   ├── domain/                       # Framework-agnostic models + zod schemas
│   │   ├── auth/                     # auth.types.ts, auth.schema.ts (JWT/session), index.ts
│   │   ├── user/                     # user.types.ts, user.schema.ts, index.ts
│   │   ├── rbac/                     # role + permission model
│   │   └── index.ts
│   │
│   ├── features/                     # Vertical slices (public API via index.ts only)
│   │   ├── auth/
│   │   │   ├── api/                  # useLogin, useRefresh, useSession (TanStack Query)
│   │   │   ├── components/           # LoginForm (RHF + zod)
│   │   │   ├── store/                # auth-store (zustand + persist): tokens + user
│   │   │   ├── hooks/                # useAuth, usePermissions
│   │   │   └── index.ts
│   │   └── users/                    # example CRUD slice (DataGrid + forms)
│   │       ├── api/                  # query keys + query/mutation hooks
│   │       ├── components/           # UsersTable, UserForm, UserDialog
│   │       ├── store/                # client-only UI state (filters, selection)
│   │       ├── hooks/
│   │       ├── types/
│   │       └── index.ts
│   │
│   ├── shared/                       # Cross-cutting, reusable building blocks
│   │   ├── api/
│   │   │   ├── http-client.ts        # typed fetch wrapper + JWT injection + 401 refresh
│   │   │   ├── query-client.ts       # QueryClient + sane defaults + global error
│   │   │   ├── query-keys.ts         # key-factory helper
│   │   │   └── api-error.ts          # normalized ApiError
│   │   ├── store/
│   │   │   ├── create-store.ts       # store factory: devtools + immer + (opt) persist
│   │   │   ├── ui-store.ts           # sidebar, modals, global UI flags, offline + update toast
│   │   │   ├── theme-store.ts        # light/dark/system (persisted)
│   │   │   └── index.ts
│   │   ├── ui/                       # shadcn components live here
│   │   │   ├── button.tsx, input.tsx, dialog.tsx, ...
│   │   │   └── data-grid/            # DataGrid (Table + Virtual), useDataGrid, columns helpers
│   │   ├── forms/
│   │   │   ├── use-zod-form.ts       # RHF + zodResolver wrapper (typed)
│   │   │   ├── form-field.tsx        # Controller + shadcn field + error display
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── env.ts                # zod-parsed import.meta.env (typed, fail-fast)
│   │   │   ├── constants.ts
│   │   │   └── feature-flags.ts
│   │   ├── lib/                      # cn(), formatters, pure utils
│   │   ├── hooks/                    # generic hooks (useDebounce, useMediaQuery)
│   │   └── types/                    # global utility types
│   │
│   ├── mocks/                        # MSW — this is the "backend"
│   │   ├── browser.ts                # setupWorker (dev)
│   │   ├── server.ts                 # setupServer (tests)
│   │   ├── db.ts                     # in-memory seed data / fixtures
│   │   └── handlers/                 # REST handlers per resource (auth, users, ...)
│   │
│   ├── test/
│   │   ├── setup.ts                  # jsdom + jest-dom + MSW server lifecycle
│   │   └── test-utils.tsx            # render() wrapped with all providers
│   │
│   ├── styles/
│   │   ├── globals.css               # tailwind v4 @import + design tokens
│   │   └── themes.css                # light/dark CSS variables
│   │
│   ├── main.tsx                      # boots MSW worker before render (dev)
│   └── vite-env.d.ts
│
├── e2e/                              # Playwright specs
├── plop-templates/                  # scaffolder .hbs templates (store/feature/domain/query/component)
├── scripts/
│   └── plopfile.ts                  # generator definitions
├── public/
│   ├── mockServiceWorker.js          # generated by `msw init` (dev/test mock backend)
│   └── icons/                        # PWA icons (generated by @vite-pwa/assets-generator)
│   # web manifest is emitted by vite-plugin-pwa at build time
├── .husky/
├── .env.example
├── components.json                  # shadcn config
├── eslint.config.ts                 # flat config
├── prettier.config.mjs
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── vite.config.ts                   # React Compiler + PWA wiring (see §4.7, §4.8)
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

### Path aliases
`@/*` → `src/*`. Optional finer aliases: `@app`, `@features`, `@shared`, `@domain`.
Wired via `tsconfig` paths + `vite-tsconfig-paths`.

### Dependency direction (enforced by lint import rules)
`app` → `features` → `shared` → `domain`.
`domain` depends on nothing. Features never import other features' internals (only their
public `index.ts`). `shared` never imports from `features`.

**Where a type belongs (`domain/` vs a feature's `types/`):** a concept that is shared,
persisted, or part of the API contract → `domain/` (e.g. `User`, `Role`). A type that only
describes a feature's local view/UI state (column config, filter form shape) → that feature's
`types/`. Rule of thumb: if a second feature could need it, it's `domain/`.

---

## 4. Default integrations (what "wired by default" means)

### 4.1 Zustand
- **`create-store.ts` factory** wraps `create` with `devtools` + `immer`, and optional
  `persist` — so every store gets consistent middleware, naming, and typing.
- **Slice pattern** for combining concerns within one store; **typed selectors** with
  `useShallow` to prevent over-rendering.
- **Default stores:** `theme-store` (mode + persistence), `ui-store` (sidebar/modals),
  and the feature-scoped `auth-store` (JWT tokens + user, persisted).
- Convention: stores expose actions as methods; components select narrow slices, never the
  whole store.

### 4.2 TanStack Query
- **`query-client.ts`** central config: `staleTime` (e.g. 60s), `gcTime` (5m),
  `retry` (smart — skip 4xx), `refetchOnWindowFocus: false` (enterprise default).
- **Global error handling** via `QueryCache`/`MutationCache` `onError` → toast + 401 →
  auth refresh/logout.
- **Query-key factories** per feature (`userKeys.all / lists / list(filters) / detail(id)`).
- **Devtools** mounted in dev only.
- Optional: thin route `loader`s call `queryClient.ensureQueryData` for prefetch; components
  still `useQuery`.

### 4.3 React Router (v8, data mode)
- **`createBrowserRouter`** with a typed route tree; **lazy route modules** via `route.lazy`
  for code-splitting.
- **Layouts as nested routes** (AuthLayout vs DashboardLayout/AppShell).
- **Guards:** `<ProtectedRoute>` reads `auth-store`; `<RequireRole permission=...>` reads RBAC.
- **Error boundaries:** root boundary + per-route `errorElement`.
- **`paths.ts`** typed path constants + builders (no stringly-typed navigation).

### 4.4 React Hook Form + Zod
- **`use-zod-form.ts`** wraps `useForm` + `zodResolver`, inferring types from the domain schema.
- **`form-field.tsx`** = RHF `Controller` + shadcn field primitives + inline error display.
- Schemas imported from `domain/` so the same Zod schema validates the form and (optionally)
  the API response.

### 4.5 DataGrid (TanStack Table + Virtual)
- Reusable `shared/ui/data-grid` wrapping Table v8 + Virtual v3.
- Features: sorting, global + column filters, pagination (client & server via `manual*`
  flags), column visibility, row selection, sticky header, virtualized rows.
- Server-driven mode integrates with TanStack Query (filters/sort/page → query key → MSW).

### 4.6 Auth (custom JWT) + RBAC + Theming
> Security note: a seed encodes the defaults others copy to production, so the defaults here
> are the *safe* ones, not the convenient ones.

- **Token storage (hardened):** the **access token lives in memory only** (a non-persisted
  Zustand slice / module variable) — never in localStorage. The **refresh token is modeled as
  an httpOnly, SameSite cookie** that the MSW `/auth/*` handlers `Set-Cookie` and the browser
  sends automatically; JS never reads it. On a cold load the app calls `/auth/refresh` (cookie
  sent automatically) to re-hydrate the access token. The persisted Zustand slice holds only
  **non-sensitive** session info (user id, roles) for instant UI, not tokens. (This is *not* a
  "small swap" from localStorage — it shapes `auth-store` + `http-client`; doing it now avoids
  teaching the XSS-token-theft anti-pattern.)
- **`http-client`** injects the in-memory access token. On **401** it runs a **single-flight
  refresh**: one shared in-flight refresh promise that all concurrent 401s await, then they
  retry once with the new token; if refresh fails it emits `auth:session-expired` once and
  clears session. (No refresh storm; this is the classic concurrent-401 bug, handled
  explicitly.)
- MSW handlers implement `/auth/login`, `/auth/refresh`, `/auth/me`. `LoginForm` is RHF + Zod.
- **RBAC (two layers, both real):**
  - *Client (UX only):* `domain/rbac` defines `Role`/`Permission` + matrix; `usePermissions`
    hook; `<Can permission=...>` component; `<RequireRole>` route guard — these only hide UI
    and are **not security** (the code is already in the bundle).
  - *Server (enforcement):* the **MSW handlers enforce permissions and return `403`** on
    unauthorized calls, so the seed demonstrates that authorization is enforced at the API,
    not the button. Documented loudly in the README/ADR.
- **Theming:** `theme-store` (light/dark/system, persisted) → `theme-provider` toggles
  `class="dark"` on `<html>`; tokens as CSS variables (shadcn convention).

### 4.7 React Compiler (the important new piece)
**Why it changed:** `@vitejs/plugin-react` v6 dropped its internal Babel (JSX + Fast Refresh
now run in Rust/oxc). The old `react({ babel: { plugins: [...] } })` form **does not work on
Vite 8** — the compiler must run through a separate `@rolldown/plugin-babel` pass.

**Install (dev):** `babel-plugin-react-compiler@1.0.0`, `@rolldown/plugin-babel@0.2.3`,
`@babel/core@8.0.1`. No runtime package (React 19).

**Config shape (`vite.config.ts`):**
```ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { babel } from '@rolldown/plugin-babel'

plugins: [
  babel({ include: /\.[jt]sx?$/, babelConfig: reactCompilerPreset() }),
  react(),
]
// build.sourcemap = true  → keep compiled output debuggable
```

**Footgun — plugin ordering:** the referenced blog
([recca0120](https://recca0120.github.io/en/2026/04/14/react-compiler-vite-v6/)) puts
`babel()` **before** `react()`; the official react.dev guide shows `react()` first. They
disagree. **Resolution (settled in Phase 1):** **`react()` first, then the babel/compiler pass**
(`plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]`) — the
react.dev order, not the blog's babel-first. Verified: the transformed output imports
`react/compiler-runtime` and components open with `_c(n)` (memo cache), while Fast Refresh
(`createHotContext`) still works. We did not need the escape hatch below.

**Fallback — the compiler is optional, the app is not.** This is a five-deep bleeding-edge
toolchain (Vite 8 / plugin-react v6 / `@rolldown/plugin-babel@0.2.3` (pre-1.0) /
`babel-plugin-react-compiler@1.0.0` / `@babel/core@8.0.1`) on the build's hottest path. The
compiler is an *optimization*, not a feature. **Explicit escape hatch:** if neither ordering
links cleanly or HMR is unusable in Phase 1, **proceed compiler-OFF** (drop the `babel()`
plugin; the app is identical, just unmemoized) and revisit later. Phase 1 must not stall on a
0.2.3 bridge. Until Phase 1 confirms the compiler is actually active, treat "on" as *intended*,
not *guaranteed* (see AGENTS.md).

**Real validation is Phase 3, not Phase 1.** The Phase-1 "Memo ✨" check only proves the
toolchain *linked* (trivial components don't need memoization). The compiler is genuinely
stress-tested in **Phase 3** against the render-heavy `DataGrid` — that is where a green light
actually means something.

**ESLint:** the compiler's lint rules ship in **`eslint-plugin-react-hooks`**
(`recommended-latest`) — enabled in the flat config so violations (rules-of-hooks / non-idiomatic
code the compiler can't optimize) surface during development, not at runtime.

### 4.8 PWA (installable app-shell — no offline data)
Implemented with **`vite-plugin-pwa`** (Workbox `generateSW`). **Scope decided after review:**
installable + app-shell precache only. The app **does not claim offline *data*** — there is no
real backend, so a built `dist` needs a real API to show anything. We do not pretend otherwise.

- **Manifest** generated by the plugin (name, theme/background colors, icons, `display:
  standalone`); icons produced from one source image via **`@vite-pwa/assets-generator`**.
- **SW strategy:** `generateSW` — precache the built **app shell + static assets** only.
  **API responses are NOT service-worker cached** — TanStack Query owns server-state caching;
  SW-caching API data causes stale, confusing results.
- **Update flow:** `workbox-window` `registerSW` (`registerType: 'prompt'`) detects a new SW →
  calls **`ui-store.showUpdateToast()`** directly (no event bus) → "Refresh to update" →
  `updateSW()`. No silent auto-reload.
- **Online/offline:** an `online/offline` listener sets a flag in `ui-store` so the UI can show
  an offline banner. (Banner only — it does not make data calls succeed offline.)

**MSW ↔ PWA service-worker split (clean, no conflict):** only **one** SW controls a scope.
- **Dev:** PWA SW off (`devOptions.enabled: false`, default) → MSW's SW serves mocked data. ✓
- **Vitest:** MSW `setupServer` (Node) — no SW. ✓  **Playwright:** MSW **browser** worker. ✓
- **Production `dist`:** the **Workbox SW** runs (shell precache); **MSW is dev/test only.**
  `public/mockServiceWorker.js` is excluded from the build so nothing registers a second SW.
- *Not chosen:* the `injectManifest` single-SW path (Workbox **+** MSW in prod) that would make
  `dist` a standalone offline demo — heavier and out of scope for this seed (§10, F-pwa).

### 4.9 Cross-store communication — direct bindings (no event bus)
**Problem:** when `auth-store` logs out, the Query cache must clear, `ui-store` must reset.
Wiring that by having stores import one another would couple them and scatter side-effects.

**Pattern (chosen):** **one wiring file**, `app/bindings.ts`, invoked once at bootstrap from
`app-providers`. It lives in **`app/`** on purpose — the composition root may import both
features and shared, so it can read a feature store and call `queryClient` / `ui-store`
directly without violating the §3 dependency direction. Reactions use **Zustand's own
`store.subscribe`** (selector form) + direct function calls. No pub/sub, no event contract,
no extra dependency — and it's compile-time-checked.

```ts
// app/bindings.ts  (sketch — called once at startup)
useAuthStore.subscribe(
  (s) => s.status,
  (status) => {
    if (status === 'unauthenticated') {
      queryClient.clear()
      useUiStore.getState().reset()
      router.navigate(paths.login)
    }
  },
)
```

**Why direct, not an event bus:** at this scale (3 stores, ~2 reactions) a typed bus is hidden
control flow and debugging-by-grep for no benefit — its "decoupling" is solved by putting the
wiring in `app/`. (This was an adversarial-review decision; see §10. If cross-cutting reactions
ever grow genuinely many-to-many, revisit a bus then — YAGNI until then.)

**Discipline:**
- **All cross-store wiring lives in `app/bindings.ts`** — never store-to-store imports, never
  ad-hoc `subscribe` scattered in components.
- Subscriptions here are **app-lifetime singletons** (set up once, never torn down), so there
  is no unsubscribe-leak surface.
- Teardown reactions are **idempotent + re-entrancy-guarded** (a `tearingDown` flag) so a
  `session-expired`-during-logout can't loop on the security-critical path.
- The PWA update prompt and offline state are plain `ui-store` calls from `app/pwa/` — no
  indirection (§4.8).

---

## 5. Scaffolder (Plop)

Generators run via Node (`npm run gen <type>`), reading templates from `plop-templates/`.

**Core generators only** (trimmed after review — fewer templates to rot on each stack bump):

| Generator | Produces |
|-----------|----------|
| `domain` | A domain entity: `*.types.ts` + `*.schema.ts` (Zod) + `index.ts`. |
| `feature` | Full vertical slice: `api/ components/ store/ hooks/ types/ index.ts`, pre-wired. |
| `mock` | An MSW handler file + db fixture for a resource. |

Deliberately **not** generators: `component` and `route` (the shadcn CLI and the router
already own those), and standalone `store`/`query` (folded into `feature`). Add them later
only if a real need appears.

**No string-injection codegen.** Generators create files; they do **not** splice snippets into
central files (route tree, handler index) — that breaks the moment Prettier reflows
the target. Instead, wiring is **convention-based discovery**: routes and MSW handlers are
collected with `import.meta.glob`, so a new file is picked up with zero edits to a shared file.

---

## 6. Tooling & quality gates

- **TypeScript:** `strict` + `noUncheckedIndexedAccess`; project references (`app` vs `node`).
- **ESLint flat config:** typescript-eslint, **react-hooks (incl. React Compiler rules)**,
  jsx-a11y, perfectionist (import order), plus an **import-boundary rule** enforcing the
  dependency direction in §3.
- **Prettier** + `prettier-plugin-tailwindcss`.
- **Husky + lint-staged** pre-commit (lint + format + typecheck on staged), **commitlint**
  (Conventional Commits).
- **Testing:** Vitest + RTL + jsdom + MSW (unit/integration); Playwright (E2E). `test-utils`
  renders with all providers; MSW is the shared mock backend.
- **Env:** `shared/config/env.ts` Zod-parses `import.meta.env` and fails fast on misconfig;
  `.env.example` documents required vars.
- **No CI pipeline** and **no deploy step** — quality gates run locally via the scripts above.

### npm scripts (planned)
`dev` · `build` (→ `dist/`) · `preview` · `lint` · `format` · `typecheck` ·
`test` · `test:watch` · `e2e` · `gen` · `prepare` (husky) · `msw:init`.

---

## 7. Phased task plan

> Each phase is independently reviewable. Acceptance criteria are the "done" bar.

### Phase 0 — Project baseline · ✅ DONE (2026-06-28)
- Init Vite + React + TS app (Node/npm), Tailwind v4, path aliases, ESLint/Prettier, Husky,
  `env.ts`, full folder skeleton, `.env.example`, README stub.
- **Done when:** `npm run dev` serves a blank shell; `npm run lint`, `npm run typecheck`,
  `npm run build` (emits `dist/`) all pass. — **all verified green.**
- **Deviations (documented):** (1) path aliases use Vite 8's native `resolve.tsconfigPaths`
  instead of the `vite-tsconfig-paths` plugin (drops a dep + deprecated `tsconfck`);
  (2) `eslint-plugin-jsx-a11y` deferred to Phase 1 (no ESLint 10 support yet);
  (3) the §3 import-boundary lint rule deferred to Phase 1 (no features to guard yet).

### Phase 1 — Core integrations + React Compiler · ✅ DONE (2026-06-29)
- React Compiler wiring (§4.7) + ESLint compiler rules; QueryClient + provider + devtools;
  `http-client`; Zustand `create-store` + `ui-store` + `theme-store`; **`app/bindings.ts`**
  (`store.subscribe`) with the `logged-out → queryClient.clear() + ui-store.reset()` reaction;
  Router data mode + layouts + error boundaries; shadcn init + base UI primitives; RHF
  `use-zod-form` + `form-field`; MSW worker bootstrapped in `main.tsx`.
- **Done when:** the provider stack renders a route; a sample form validates with Zod; a
  sample query resolves against MSW; **and the React Compiler toolchain links** — HMR preserves
  state *and* the React DevTools "Memo ✨" badge appears (settles §4.7 ordering). **If neither
  ordering links / HMR is unusable → take the §4.7 escape hatch (compiler OFF) and proceed;
  do not stall the phase.** (Deep compiler validation is Phase 3, not here.) — **all verified green.**
- **Outcome:** acceptance met live in-browser — home + 404 routes render in the themed shell
  (dark via system pref); the demo query resolves against MSW (`GET /api/health` → `200 ok`);
  the demo form shows Zod errors on invalid input and submits on valid; no console errors.
  **Compiler confirmed active** — the transformed `HomePage` imports `react/compiler-runtime`
  and opens with `const $ = _c(11)` (memo cache), with Fast Refresh (`createHotContext`)
  coexisting; the escape hatch was **not** needed. **§4.7 ordering settled: `react()` first,
  then the babel/compiler pass** (the official react.dev order, not the blog's babel-first).
- **Deviations (documented):** (1) the `logged-out → queryClient.clear() + ui-store.reset()`
  reaction is **scaffolded as a documented extension point** in `app/bindings.ts`, not live —
  it depends on `auth-store`, which lands in Phase 2; the live binding shipped now is
  `online/offline → ui-store`. (2) devtools are lazy + DEV-gated (kept out of the prod bundle).
  (3) jsx-a11y + the §3 import-boundary lint rule remain deferred (carried over from Phase 0).

### Phase 2 — Enterprise cross-cutting
- Auth feature (JWT store, login, refresh, guards, 401 handling) with MSW auth handlers;
  RBAC (`domain/rbac`, `usePermissions`, `<Can>`, `<RequireRole>`); theming/dark-mode toggle.
- **Done when:** unauthenticated users are redirected to login; access/refresh token flow
  works against MSW; role-gated route + UI hide correctly; theme persists across reload.

### Phase 3 — DataGrid + example `users` feature
- `DataGrid` (Table + Virtual); `users` slice: list (server-driven grid via MSW),
  create/edit (RHF + Zod dialog), delete, with Query invalidation; MSW `users` handlers + db.
- **Done when:** users grid sorts/filters/paginates against MSW; create/edit/delete update
  the cache; virtualized rows scroll smoothly. **React Compiler stress-check here** (the real
  one): the render-heavy grid stays correct + the "Memo ✨" badge holds under scroll/sort; if
  the compiler misbehaves on this code, fall back to compiler-OFF (§4.7) before going further.

### Phase 4 — Scaffolder
- Plop generators + templates for store/domain/query/feature/mock/component/route;
  `npm run gen` script.
- **Done when:** `npm run gen feature foo` produces a compiling, lint-clean slice (incl. an
  MSW handler) wired into the app.

### Phase 5 — Testing harness
- **Vitest + RTL** use MSW `setupServer` (Node — no service worker).
- **Playwright drives a real browser, so it cannot use `setupServer`.** It runs against the
  **dev server (or a preview build with the MSW browser worker enabled)** — never against the
  shipped `dist` (which has no backend). Same shared handlers, different MSW entry point.
- Smoke E2E: login → users grid.
- **Done when:** `npm test` and `npm run e2e` pass on a fresh checkout; the E2E target's MSW
  worker is explicitly the browser worker, not `setupServer`.

### Phase 6 — PWA (installable shell)
- `vite-plugin-pwa` manifest + icons (`@vite-pwa/assets-generator`); Workbox app-shell
  precache; `registerSW` update flow → `ui-store.showUpdateToast()` (direct, no bus); offline
  banner via `online/offline` → `ui-store`; exclude `mockServiceWorker.js` from the build
  (§4.8 SW split).
- **Done when:** a production `npm run build` + `npm run preview` is installable and loads the
  **app shell** offline, and shows the update toast when a new build is served. (No offline-data
  claim — data needs a real API.)

### Phase 7 — Docs
- README (run/scaffold/conventions), ADRs for the §1 decisions (incl. React Compiler,
  MSW-as-backend, direct-binding cross-store comms, auth-security defaults, and the
  installable-shell PWA), and a CONTRIBUTING note on the dependency-direction rule. Keep
  `AGENTS.md` in sync.
- **Done when:** a new dev can clone, run, and scaffold a feature using only the docs.

---

## 8. Resolved decisions (your answers)

1. **API:** REST, **MSW-mocked only** — no real backend. MSW is the single mock backend for
   dev *and* tests; handlers + seed data live in `src/mocks/`.
2. **Auth:** **custom JWT** — access token in **memory**, refresh token as an **httpOnly
   cookie** (MSW-simulated), single-flight refresh on 401. (No external IdP.) See §4.6.
3. **Scope:** **single app** — no monorepo/workspaces.
4. **CI:** **none** — quality gates are local (husky/lint-staged) only.
5. **Deploy:** **none** — `npm run build` produces `dist/`; nothing is published or hosted.
6. **Storybook:** **excluded.**

### Remaining assumptions (flag if wrong)
- **i18n** stays out of scope for v1; structure is left i18n-ready but unwired.
- **JWT storage (revised after review):** access token **in memory only**; refresh token as an
  **httpOnly cookie** simulated by MSW; persisted Zustand holds only non-sensitive session info
  (user id, roles). This is the safe default a seed should teach — *not* tokens in localStorage.
- **MSW in the production build (decided):** MSW serves **dev + tests only**; the Workbox SW
  owns production (installable shell). `dist` needs a real API for data — the standalone
  offline-demo (`injectManifest` + MSW) path was considered and **not** chosen (§4.8, §10).

---

## 9. Risks / notes
- **React Compiler ordering (Vite 8 / plugin-react v6):** the #1 setup footgun — resolved by
  the Phase 1 "Memo ✨ + HMR" acceptance check rather than copying either tutorial blindly.
  Sources disagree (blog: babel-before-react; react.dev: react-before-babel).
- **plugin-react v6 dropped Babel:** any tutorial using `react({ babel: {...} })` is stale on
  this stack — all Babel passes go through `@rolldown/plugin-babel`.
- **React Router v7→v8 package move:** use `react-router` (not `react-router-dom`).
- **Tailwind v4 + shadcn:** confirm the shadcn CLI + `components.json` target the v4 token
  format and React 19.
- **Zod v4:** API differs from v3 — ground schema/form code in current Zod v4 docs.
- **MSW in two runtimes:** the Service Worker (`public/mockServiceWorker.js` via `msw init`)
  for the browser/dev + Playwright, and `setupServer` for Vitest — keep handlers shared so
  dev and tests can't drift.
- **MSW ↔ PWA service worker:** only one SW controls a scope — see §4.8. Decided: MSW in
  dev/test, Workbox SW in prod; `mockServiceWorker.js` excluded from the build; never two at `/`.
- **PWA caching vs Query:** never let Workbox runtime-cache API responses — TanStack Query is
  the server-state cache; SW-caching API data causes stale results.
- **Cross-store bindings discipline:** all cross-store wiring lives in `app/bindings.ts` via
  `store.subscribe` (no event bus, no store↔store imports). Subscriptions are app-lifetime
  singletons; teardown handlers are idempotent + re-entrancy-guarded so
  `session-expired`/`logged-out` can't loop (§4.9).
- **Concurrent-401 refresh storm (classic JWT bug):** the http-client **must** use a
  single-flight refresh (one shared in-flight promise) — see §4.6. Without it, N simultaneous
  401s trigger N refreshes and retries with a stale token.
- **Security defaults a seed must not get wrong:** no tokens in localStorage (XSS theft);
  client RBAC is cosmetic — MSW handlers return `403` so enforcement is demonstrated at the
  API. (§4.6.)
- **`@babel/core` peer dep:** must be installed explicitly for `@rolldown/plugin-babel`.
- **"Wired by default" caveat:** items marked *optional* in §4 (router loader prefetch) and the
  compiler until Phase 1 confirms it are **not** guaranteed-wired — don't read §4 as all-on.

---

## 10. Adversarial review — resolutions

A devil's-advocate pass challenged this plan. Dispositions below (✅ accepted & applied,
🟡 user decision, ⚪ rejected/deferred with reason).

| # | Finding | Disposition |
|---|---------|-------------|
| F1 | Event-bus justification (cycles) is false under §3; bus is a workaround for `bindings.ts` being in `shared/` | ✅ **Event bus dropped** (F-bus chosen). `app/bindings.ts` uses `store.subscribe` + direct calls (§4.9) |
| F2 | Bus puts re-entrant hidden control flow on the logout/session path | ✅ Teardown now idempotent + re-entrancy-guarded (§4.9, §9) |
| F3 | Free-floating bus → forgotten-`off()` leaks | ✅ Only `app/bindings.ts` subscribes; components never do (§4.9, AGENTS rule 2) |
| F4 | "~20-line typed bus" is optimistic; bus traffic invisible to devtools | ✅ Moot — bus dropped (F-bus); no emitter to debug |
| F5–F6 | PWA + no backend = prod app with no data source; coherent path (MSW-in-prod) is marked "optional" | ✅ **PWA scoped to installable shell** (F-pwa chosen); no offline-data claim (§4.8) |
| F7 | Playwright (real browser) can't use `setupServer`; "tests ✓" overstated | ✅ Phase 5 + §4.8 corrected: Playwright uses the **browser** worker |
| F8 | `mockServiceWorker.js` ships in `dist` even when unused | ✅ Folds into **F-pwa**; if split kept, it's dead code (documented) |
| F9 | 5-deep bleeding-edge compiler toolchain, no fallback | ✅ Explicit **compiler-OFF escape hatch** added (§4.7, Phase 1) |
| F10 | Ordering "vibe check" assumes one ordering works, no plan C | ✅ Escape hatch is plan C (compiler is optional) |
| F11 | Phase-1 "Memo ✨" check is too early to be meaningful | ✅ Real stress-validation moved to **Phase 3** (DataGrid) |
| F12 | AGENTS.md asserts "compiler on" as settled vs plan's "unverified" | ✅ AGENTS rule 5 softened to "intended on, confirmed in Phase 1" |
| F13 | Import-boundary rule's main effect was to manufacture the bus | ✅ Dissolved by F1 (bindings in `app/`); rule kept light |
| F14 | Per-slice barrels can defeat tree-shaking / cycle warnings | ⚪ Keep thin barrels; revisit if Rolldown warns. Taste |
| F15 | `domain/` vs feature `types/` ownership ambiguous | ✅ Rule added to §3 ("if a second feature could need it → `domain/`") |
| F16 | Refresh token in localStorage = XSS theft; "small swap" is wrong | ✅ **Hardened:** access token in-memory, refresh as httpOnly cookie (§4.6) |
| F17 | Client-only RBAC presented as RBAC; teaches "hide the button" | ✅ MSW handlers now enforce `403`; client RBAC labeled UX-only (§4.6) |
| F18 | Scaffolder over-scoped (7 gens) + fragile string-injection wiring | ✅ Trimmed to 3 gens; wiring via `import.meta.glob`, no string injection (§5) |
| F19 | 401 refresh single-flight completely hand-waved (classic JWT bug) | ✅ Single-flight refresh now explicit (§4.6, §9) |
| F20 | "Wired by default" overstates optional/unverified items | ✅ Caveat added (§9) |

### Decisions (now resolved)

- **F-bus — cross-store comms:** **Simplify to direct bindings.** Event bus dropped;
  `app/bindings.ts` wires reactions with `store.subscribe` + direct calls. `shared/events/`
  removed. (§4.9)
- **F-pwa — PWA scope:** **Installable shell only.** `vite-plugin-pwa` `generateSW` precaches
  the app shell; no offline-data claim; MSW stays dev/test; `dist` needs a real API for data.
  (§4.8)

---

## Sources (React Compiler research)
- [Installation – React (react.dev)](https://react.dev/learn/react-compiler/installation)
- [React Compiler 1.0 + Vite 8: The Right Way to Install After @vitejs/plugin-react v6 Drops Babel — recca0120](https://recca0120.github.io/en/2026/04/14/react-compiler-vite-v6/)
- [vite-plugin-react — React Compiler Integration (DeepWiki)](https://deepwiki.com/vitejs/vite-plugin-react/3.3-react-compiler-integration)
```
