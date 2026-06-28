# React Zustand Seed

Enterprise React SPA seed — **Vite 8 + React 19 (React Compiler) + TypeScript 6**, with
Zustand (client state), TanStack Query (server state), TanStack Table + Virtual (data grid),
React Router v8 (data mode), React Hook Form + Zod (forms), shadcn/ui (Tailwind v4), and MSW
as the mock backend. Installable PWA. Node + npm.

> **Status: Phase 0 (baseline) in place.** The full build runs in phases — see
> [`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md). Conventions for working
> in this repo are in [`AGENTS.md`](AGENTS.md).

## Requirements

- Node `>=20` (developed on Node 24), npm.

## Getting started

```bash
npm install
cp .env.example .env   # optional — env.ts provides safe defaults
npm run dev            # http://localhost:5173
```

## Scripts

| Script                            | Does                                     |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Start the Vite dev server                |
| `npm run build`                   | Type-check (`tsc -b`) + build to `dist/` |
| `npm run preview`                 | Serve the built `dist/`                  |
| `npm run typecheck`               | Type-check only                          |
| `npm run lint` / `lint:fix`       | ESLint (flat config)                     |
| `npm run format` / `format:check` | Prettier                                 |

## Layout (target architecture)

```
src/app/      composition root (providers, router, layouts, error, pwa, bindings)
src/domain/   framework-agnostic models + Zod schemas
src/features/ vertical feature slices
src/shared/   api, store, ui, forms, config, lib, hooks, types
src/mocks/    MSW handlers + fixtures (the mock backend)
src/test/     test setup + utilities
```

Most folders are scaffolded empty in Phase 0 and filled in later phases.

## What Phase 0 includes

Vite + React + TS baseline, Tailwind v4, `@/*` path aliases, ESLint (flat) + Prettier,
Husky + lint-staged + commitlint, validated env (`src/shared/config/env.ts`), and the folder
skeleton. **Deferred to Phase 1:** React Compiler wiring, `eslint-plugin-jsx-a11y` (awaiting an
ESLint 10-compatible release), and the import-boundary lint rule.
