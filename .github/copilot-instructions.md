# GitHub Copilot instructions

This is **react-zustand-seed**, an enterprise React SPA seed/reference app. Follow these rules for
every suggestion, edit, and coding-agent task. The full operating manual is
[`AGENTS.md`](../AGENTS.md) (source of truth); rationale is in [`CONTRIBUTING.md`](../CONTRIBUTING.md)
and the [ADRs](../docs/adr/).

## Stack & tooling

- Vite 8 + React 19 (**React Compiler on**) + TypeScript 6 (strict). **npm only** (not yarn/pnpm/
  bun); Node `>=20`.
- Zustand (client state), TanStack Query (server state), TanStack Table + Virtual (`DataGrid`),
  React Router v8 (data mode), React Hook Form + Zod, shadcn/ui + Tailwind v4, MSW (mock backend).

## Hard rules — do not violate

1. **State separation:** server data → TanStack Query; client/UI/session → Zustand. Never mirror
   server data into a store.
2. **Cross-store reactions live only in `src/app/bindings.ts`** (`store.subscribe` + direct calls).
   No event bus; stores never import each other.
3. **Dependency direction:** `app → features → shared → domain`. `domain` imports nothing;
   `shared` never imports `features`; a feature imports another feature only via its public
   `index.ts`. Route paths live in `src/shared/config/paths.ts` (so features don't import `app`).
4. **MSW is the backend** (`src/mocks`). Handlers enforce authorization (return `403`). Add a
   handler when you add an endpoint — it auto-registers via `import.meta.glob`.
5. **React Compiler is on — write plain React.** Do NOT add `useMemo` / `useCallback` /
   `React.memo`. The only opt-out is `DataGrid` (TanStack Table's `useReactTable`).
6. **Forms:** React Hook Form + Zod via `useZodForm`; schemas live in `src/domain/**` and are
   reused for request/response validation.
7. **Routing:** import from `react-router` (NOT `react-router-dom`); navigate via `paths`, not raw
   strings.
8. **Auth security:** access token **in memory only** (never `localStorage`); refresh token is an
   httpOnly cookie; 401s use a single-flight refresh; client `<Can>` / `<RequireRole>` are
   **UX-only** — the API enforces authorization.
9. **Use the scaffolder** for new code: `npm run gen feature|domain|mock <name>`. Don't hand-roll
   slice structure. A generated feature's handler auto-wires; add its route to
   `src/app/router/routes.tsx` (the generator prints the line).
10. **PWA:** never service-worker-cache `/api` (TanStack Query owns server-state caching); one SW
    per scope (MSW in dev, Workbox in prod).

## Code style

- **Function expressions** (`const Foo = () => …`), not declarations. (shadcn files in
  `src/shared/ui` stay in their upstream form.)
- TypeScript `strict` + `noUncheckedIndexedAccess`; **no `any`** — model real types in `domain/`.
- Small, single-purpose, readable units; `cn()` (clsx + tailwind-merge) for class composition.

## Before finishing a change

Keep all of these green, then use Conventional Commits:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Out of scope — do not add

A real backend (MSW only), CI/deploy pipelines, Storybook, manual memoization,
`react-router-dom`, or tokens in `localStorage`.
