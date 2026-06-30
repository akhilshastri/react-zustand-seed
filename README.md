# React Zustand Seed

An enterprise-grade React SPA seed and reference app — **Vite 8 + React 19 (React Compiler) +
TypeScript 6**, with Zustand (client state), TanStack Query (server state), TanStack Table +
Virtual (data grid), React Router v8 (data mode), React Hook Form + Zod (forms), shadcn/ui
(Tailwind v4), and **MSW as the entire backend**. Custom-JWT auth + RBAC, theming, an installable
PWA shell, a Plop scaffolder, and Vitest + Playwright tests — all wired and working.

> **There is no real backend.** MSW mocks the REST API for dev _and_ tests. A production `dist`
> needs a real API to show data; it ships as an installable app shell only. This is intentional —
> see [ADR-0002](docs/adr/0002-msw-as-the-backend.md).

📚 **How-To guides** — a step-by-step series from your first generated component to advanced
routing — are published at **<https://akhilshastri.github.io/react-zustand-seed/>**
(source in [`docs/how-to/`](docs/how-to/)).

Build rationale and the phased history live in
[`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md). The day-to-day operating
rules are in [`AGENTS.md`](AGENTS.md). Key decisions are recorded as [ADRs](docs/adr/).

## Stack

| Area         | Choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Build / lang | Vite 8, React 19 (**React Compiler**), TypeScript 6 (strict)           |
| Client state | Zustand 5 (devtools + immer + optional persist)                        |
| Server state | TanStack Query 5                                                       |
| Data grid    | TanStack Table 8 + Virtual 3 (the reusable `DataGrid`)                 |
| Routing      | React Router 8 (`react-router`, data mode)                             |
| Forms        | React Hook Form 7 + Zod 4 (`use-zod-form`)                             |
| UI           | shadcn/ui + Tailwind CSS v4                                            |
| Mock backend | MSW 2 (dev Service Worker + Vitest `setupServer` + Playwright browser) |
| Auth         | Custom JWT (in-memory access token + httpOnly refresh cookie) + RBAC   |
| PWA          | vite-plugin-pwa (installable shell, no offline data)                   |
| Tests        | Vitest 4 + Testing Library + jsdom · Playwright 1.61                   |
| Scaffolder   | Plop (`npm run gen`)                                                   |

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

Requirements: **Node `>=20`** (developed on Node 24) and npm. `.env` is optional —
`src/shared/config/env.ts` Zod-parses `import.meta.env` and provides safe defaults; copy
`.env.example` to `.env` to override.

**Sign in** with a seeded account (all use the password `password`):

| Email                 | Role    | Can                                   |
| --------------------- | ------- | ------------------------------------- |
| `admin@example.com`   | admin   | read / create / update / delete users |
| `manager@example.com` | manager | read / create / update users          |
| `viewer@example.com`  | viewer  | read users only                       |

## Scripts

| Script                            | Does                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Vite dev server with the MSW mock backend                   |
| `npm run build`                   | Type-check (`tsc -b`) + build to `dist/` (emits the PWA SW) |
| `npm run preview`                 | Serve `dist/` — test the PWA / installable shell here       |
| `npm run typecheck`               | Type-check only                                             |
| `npm run lint` / `lint:fix`       | ESLint (flat config)                                        |
| `npm run format` / `format:check` | Prettier                                                    |
| `npm test` / `test:watch`         | Vitest + Testing Library + MSW (`setupServer`)              |
| `npm run e2e`                     | Playwright smoke (login → users grid)                       |
| `npm run gen <generator> <name>`  | Plop scaffolder (`domain`, `feature`, `mock`)               |

## Project structure

Feature-Sliced (FSD-lite) with a composition root. Dependency direction is
**`app → features → shared → domain`**; `domain` depends on nothing (see
[ADR-0007](docs/adr/0007-feature-sliced-architecture.md)).

```
src/
├── app/        composition root: providers, router (+ guards), layouts, error, pwa, bindings.ts
├── domain/     framework-agnostic models + Zod schemas (auth, user, rbac)
├── features/   vertical slices (auth, users, home, admin): api/ components/ store/ hooks/ types/
├── shared/     api (http-client, query-client), store (create-store factory),
│               ui (shadcn + data-grid), forms, config (env, paths), lib, hooks
├── mocks/      MSW — handlers, db fixtures, browser + server setup   ← the backend
└── test/       Vitest setup + provider-aware render()
```

## The rules that matter

The full operating manual is [`AGENTS.md`](AGENTS.md). The essentials:

- **State separation** — server data lives in TanStack Query; client/UI/session state lives in
  Zustand. Never mirror server data into a store. ([ADR-0001](docs/adr/0001-state-separation.md))
- **Cross-store reactions live only in `app/bindings.ts`** via `store.subscribe` + direct calls —
  no event bus, no store-to-store imports.
  ([ADR-0004](docs/adr/0004-cross-store-direct-bindings.md))
- **React Compiler is on** — write plain React; do not hand-add `useMemo` / `useCallback` /
  `React.memo`. ([ADR-0003](docs/adr/0003-react-compiler.md))
- **MSW is the backend** and it **enforces authorization** (returns `403`). Client `<Can>` /
  `<RequireRole>` only hide UI. ([ADR-0005](docs/adr/0005-auth-security-defaults.md))
- **Auth security** — the access token lives **in memory only** (never localStorage); the refresh
  token is an httpOnly cookie; 401s trigger a single-flight refresh.

## Scaffolding

```bash
npm run gen feature billing   # vertical slice (types, api, store, page, index) + an MSW handler
npm run gen domain invoice    # Zod schema + inferred type + barrel
npm run gen mock payments     # a standalone MSW handler
```

A generated feature's MSW handler is **auto-wired** (handlers are collected with
`import.meta.glob`). Wiring a feature's page into the router is one explicit step — the generator
prints the line to add to `src/app/router/routes.tsx` (the guarded data-router needs explicit
placement). See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Testing

- **Unit / integration** — Vitest + Testing Library + jsdom; the network is MSW via `setupServer`
  (Node, no service worker). Render through `src/test/test-utils.tsx`, which wraps a fresh
  QueryClient + router. `npm test`.
- **E2E** — Playwright drives headless Chromium against the dev server, which uses MSW's **browser**
  worker (never `setupServer`, never the shipped `dist`). `npm run e2e`.

## PWA

`npm run build` emits a Workbox service worker + web manifest; the app is installable and the
**app shell** is precached, so it loads offline. **There is no offline data** — the built `dist`
has no backend, so live data needs a real API. The MSW worker is excluded from `dist` (only the
Workbox SW ships). Test it with `npm run preview`.
([ADR-0006](docs/adr/0006-installable-shell-pwa.md))

## Notes / scope

- **MSW-only, no real server.** Auth tokens are mock-signed (not real crypto) — see
  `src/mocks/auth-tokens.ts`. To talk to a real API, replace `src/mocks` and point
  `VITE_API_BASE_URL` at it.
- **No CI, no deploy, no Storybook** — out of scope for this seed (`npm run build` just produces
  `dist/`).
