# AGENTS.md

Repo guide for AI agents and humans. Keep it short and current. The **full plan and
rationale live in [`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md)** —
this file is the quick operating manual.

> **Status:** greenfield. The app is **not built yet**; the plan is approved-in-progress.
> Build it in the phase order from the plan (§7).

---

## What this is

An enterprise React **PWA** (SPA): Vite + React 19 (**React Compiler on**), Zustand for
client state, TanStack Query for server state, TanStack Table + Virtual for the data grid,
React Router v8 (data mode), React Hook Form + Zod for forms, shadcn/ui (Tailwind v4).
The backend is **MSW only** (mocked REST, no real server). Auth is **custom JWT**.

## Stack (pinned latest as of 2026-06-28)

Node + **npm** · React/React-DOM 19.2 · Vite 8.1 · TypeScript 6.0 (strict) ·
react-router 8.0 · zustand 5.0 · @tanstack/react-query 5.101 · @tanstack/react-table 8.21 +
react-virtual 3.14 · react-hook-form 7.80 + zod 4 · shadcn/ui + tailwindcss v4 ·
babel-plugin-react-compiler 1.0 (via @rolldown/plugin-babel) · msw 2.14 · vitest 4 +
@testing-library/react 16 · @playwright/test 1.61 · vite-plugin-pwa 1.3.

## Commands (planned npm scripts)

| Script                                  | Does                                            |
| --------------------------------------- | ----------------------------------------------- |
| `npm run dev`                           | Vite dev server (MSW mock backend active)       |
| `npm run build`                         | Type-check + build to `dist/` (PWA SW emitted)  |
| `npm run preview`                       | Serve the built `dist/` (test PWA/offline here) |
| `npm run lint` / `format` / `typecheck` | ESLint (flat) / Prettier / `tsc --noEmit`       |
| `npm test` / `test:watch`               | Vitest + RTL + MSW                              |
| `npm run e2e`                           | Playwright                                      |
| `npm run gen <type>`                    | Plop scaffolder (see "Adding things")           |

---

## The rules that matter (read before writing code)

1. **State separation is the law.** Server data → **TanStack Query**. Client/UI/session →
   **Zustand**. Never copy server data into a Zustand store.
2. **Cross-store reactions live ONLY in `app/bindings.ts`** (no event bus). Stores **must not
   import each other**. Wire reactions there with Zustand `store.subscribe` + direct calls
   (`app/` may import features + shared). Subscriptions are app-lifetime singletons; teardown
   handlers must be idempotent + re-entrancy-guarded. No ad-hoc `subscribe` in components.
   (Plan §4.9.)
3. **Dependency direction:** `app → features → shared → domain`. `domain` imports nothing.
   Features import other features only via their public `index.ts` — never their internals.
   `shared` never imports from `features`. (Enforced by an ESLint import-boundary rule.)
4. **MSW is the backend.** All API behavior lives in `src/mocks/handlers` + `src/mocks/db.ts`,
   shared by dev (browser Service Worker) and Vitest (`setupServer`, Node). Playwright uses the
   **browser** worker, not `setupServer`. Handlers **enforce authz (return `403`)** — don't let
   the mock be a yes-man. Add a handler when you add an endpoint; keep handlers identical.
5. **React Compiler is _intended_ on — write plain React.** Do **not** hand-add `useMemo` /
   `useCallback` / `React.memo`; the compiler does memoization. Obey
   `eslint-plugin-react-hooks` (rules-of-hooks + compiler rules). **Caveat:** the compiler is
   only _confirmed active_ once Phase 1 passes; if Phase 1 takes the compiler-OFF escape hatch
   (§4.7), this rule is suspended until it's back on. Don't write perf-critical code before
   Phase 3 anyway.
6. **Forms = RHF + Zod via `use-zod-form`.** Schemas live in `src/domain/**`, reused by the
   form and (optionally) response parsing. Don't duplicate validation.
7. **Routing:** import from **`react-router`** (NOT `react-router-dom`). Navigate via typed
   `paths.ts`, not raw strings. Data fetching stays in Query, not router loaders (loaders may
   only do auth/prefetch via `queryClient.ensureQueryData`).
8. **PWA:** never let the service worker runtime-cache API responses (Query owns that).
   Only one SW per scope — MSW SW in dev, Workbox SW in prod. (Plan §4.8.)
9. **Use the scaffolder.** Don't hand-roll a new feature/store/domain type/handler — generate
   it so structure stays consistent.
10. **Auth security defaults (a seed teaches these).** Access token **in memory only** — never
    localStorage. Refresh token = **httpOnly cookie** (MSW-simulated); JS never reads it. 401
    handling uses a **single-flight refresh** (one shared in-flight promise). Client `<Can>` /
    `<RequireRole>` are **UX only, not security** — real enforcement is the API's `403`.

## Code style

- **Function expressions** over declarations (`const Foo = () => …`).
- TypeScript `strict` + `noUncheckedIndexedAccess`; no `any` — model real types in `domain/`.
- Small, single-purpose, readable units. No premature abstraction or clever one-liners.
- `cn()` (clsx + tailwind-merge) for class composition; shadcn primitives from `shared/ui`.
- Conventional Commits (commitlint). Husky + lint-staged gate commits (lint/format/typecheck).

---

## Where things live

```
src/app/        composition root: providers, router (+guards), layouts, error, pwa, bindings.ts
src/domain/     framework-agnostic models + Zod schemas (auth, user, rbac)
src/features/   vertical slices (auth, users): api/ components/ store/ hooks/ types/ index.ts
src/shared/     api (http-client, query-client), store (create-store factory),
                ui (shadcn + data-grid), forms, config, lib, hooks
src/mocks/      MSW — handlers, db fixtures, browser + server setup  ← the "backend"
src/test/       Vitest setup + provider-aware render()
```

## Adding things (use Plop — 3 core generators)

- **Feature slice:** `npm run gen feature <name>` → full slice (api/store/components/types) +
  an MSW handler. Routes & handlers are auto-discovered via `import.meta.glob` (no central-file
  edits, no string-injection codegen).
- **Domain entity:** `npm run gen domain <name>` → `*.types.ts` + `*.schema.ts` + `index.ts`.
- **MSW handler:** `npm run gen mock <resource>` → handler + db fixture (enforce authz/`403`).
- **Cross-store reaction:** add a `store.subscribe` block in `app/bindings.ts` calling the
  target store/`queryClient` directly. Do **not** wire store-to-store or add an event bus.
- **Component / route:** use the shadcn CLI / add a route module — not a generator.

## Testing

- Unit/integration: Vitest + RTL, render via `src/test/test-utils.tsx` (wraps all providers),
  network via MSW `setupServer`. Test behavior, not implementation.
- E2E: Playwright smoke flow (login → users grid) against the **dev/preview server with MSW's
  browser worker** (Playwright can't use `setupServer`, and never runs against `dist`).

## Do not

- Mirror server state into Zustand · import one store/feature from another directly · add an
  event bus or wire cross-store reactions outside `app/bindings.ts` · add manual memoization ·
  use `react-router-dom` · SW-cache API calls · put tokens in localStorage · hand-create slices
  instead of scaffolding · introduce a real backend (this seed is MSW-only) · add CI/deploy
  config (out of scope) · add Storybook (excluded).

---

_Keep this file in sync with `plan/01-enterprise-app-plan.md` whenever architecture changes._
