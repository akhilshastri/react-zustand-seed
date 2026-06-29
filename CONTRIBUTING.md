# Contributing

This is a seed/reference app. The conventions below keep it consistent as it grows. The full
operating manual is [`AGENTS.md`](AGENTS.md); architectural rationale is in
[`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md) and the [ADRs](docs/adr/).

## The dependency-direction rule

Layers may only depend **inward**:

```
app  →  features  →  shared  →  domain
```

- **`domain`** depends on nothing (framework-agnostic models + Zod schemas).
- **`shared`** may import `domain`, never `features` or `app`.
- **`features`** may import `shared` + `domain`, and **other features only through their public
  `index.ts`** — never another feature's internal files.
- **`app`** is the composition root; it may import anything. This is why cross-store wiring lives
  in `app/bindings.ts` and route paths live in `shared/config/paths.ts` (so features navigate by
  constant without importing `app`).

This is currently a **convention** — the import-boundary ESLint rule is not yet enabled (no
compatible flat-config plugin was wired). Keep to it manually; review for violations.

## Adding a feature

1. Generate the slice:
   ```bash
   npm run gen feature billing
   ```
   You get `src/features/billing/{types,api,store,components,index.ts}` plus
   `src/mocks/handlers/billing.ts`. The handler is **auto-registered** (handlers are collected
   with `import.meta.glob` — no central registry to edit).
2. Add the route. The generator prints the line to add to `src/app/router/routes.tsx`; place the
   page under `ProtectedRoute` (and `RequireRole` if it needs a permission). The data-router's
   guard/layout nesting is explicit by design, so routing is the one manual step.
3. Build the real behaviour: query/mutation hooks in `api/` (keys via `createQueryKeys`,
   invalidate on writes), client UI state in `store/` (via the `createStore` factory), forms with
   `use-zod-form` + a `domain` schema, and the MSW handler enforcing authorization (`403`).
4. Expose only the page (and anything other features legitimately need) from the slice's
   `index.ts`.

## Conventions

- **State separation:** server data → TanStack Query; client/UI/session → Zustand. Never mirror
  server data into a store.
- **Cross-store reactions:** only in `app/bindings.ts` (`store.subscribe` + direct calls). No
  event bus, no store-to-store imports.
- **React Compiler is on:** write plain React; don't hand-add `useMemo` / `useCallback` /
  `React.memo`. (The one documented exception is `DataGrid`, which the compiler safely skips
  because of `useReactTable` — TanStack Table memoizes itself.)
- **Forms:** RHF + Zod via `use-zod-form`; schemas live in `src/domain/**` and are reused for
  request/response validation.
- **Routing:** import from `react-router` (not `react-router-dom`); navigate via `paths`.
- **Auth security:** access token in memory only (never localStorage); refresh token is an
  httpOnly cookie; client RBAC is UX-only — the MSW handlers enforce `403`.
- **Style:** function expressions (`const Foo = () => …`); TypeScript `strict` +
  `noUncheckedIndexedAccess`; no `any`; small, single-purpose units; `cn()` for class composition;
  shadcn primitives from `shared/ui`. shadcn-sourced UI files stay in their upstream form.

## Before you commit

The gates that must pass (Husky + lint-staged run lint + format on staged files; commitlint
enforces Conventional Commits):

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Use **Conventional Commits** (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:` …). Keep
changes small and reviewable; update `AGENTS.md` / the relevant ADR when an architectural rule
changes.
