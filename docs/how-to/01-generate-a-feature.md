# 01 — Generate a Feature

Goal: scaffold a complete vertical slice — types, API hook, store, page, barrel, **and** a mock
handler — with one command. This is the obvious first move after cloning: don't hand-roll a
feature, generate it so its shape matches every other slice.

## Run the generator

```bash
npm run gen feature invoices
```

`gen` is [Plop](https://plopjs.com) (see `plopfile.mjs`). The name must be kebab-case
(`invoices`, `audit-log`). This creates seven files:

```
src/features/invoices/
├── types/invoices.types.ts        # local shape for the slice
├── api/invoices-keys.ts           # typed query-key namespace
├── api/use-invoices-list.ts       # a sample list query
├── store/invoices-store.ts        # a Zustand UI store
├── components/invoices-page.tsx   # the page component
└── index.ts                       # public surface (barrel)
src/mocks/handlers/invoices.ts     # MSW handler at /api/invoices
```

## What you got

**`index.ts`** — the slice's only public door. Other features import from here, never from
internal files:

```ts
export * from './components/invoices-page'
```

**`api/invoices-keys.ts`** — a namespaced query-key factory (caching + invalidation in guide 07):

```ts
import { createQueryKeys } from '@/shared/api'
export const invoicesKeys = createQueryKeys('invoices')
```

**`api/use-invoices-list.ts`** — a TanStack Query hook. `http.get('/invoices')` resolves to
`/api/invoices` (the `http` client prefixes `VITE_API_BASE_URL`, which defaults to `/api`):

```ts
export const useInvoicesList = () =>
  useQuery({
    queryKey: invoicesKeys.lists(),
    queryFn: () => http.get<Invoices[]>('/invoices'),
  })
```

**`store/invoices-store.ts`** — a Zustand store for **client/UI** state only (here, a selected
id), built with the shared `createStore` factory (devtools + immer). More in guide 06.

**`components/invoices-page.tsx`** — a working page: it reads the list query, renders loading /
error / data states, and tracks a selection in the store.

**`mocks/handlers/invoices.ts`** — the mock endpoint, returning two placeholder rows. It
**auto-registers**: `src/mocks/handlers/index.ts` collects every file in the folder with
`import.meta.glob`, so there is no central registry to edit. (Guide 05 makes this realistic.)

## The one manual step

The generator can't safely place your route — the guarded data-router needs explicit positioning
— so it **prints the line to add** when it finishes:

```
↳ add a route for InvoicesPage in src/app/router/routes.tsx (the guarded data-router needs explicit placement)
```

We do exactly that in [guide 04](./04-wire-routing.md). Until then the feature exists but isn't
reachable.

> **Heads-up on the name:** `pascalCase('invoices')` is `Invoices`, so the generated _type_ is
> `Invoices` and the component is `InvoicesPage`. The placeholder type is a stand-in — guide 03
> replaces it with a real `invoice` domain entity.

> **Rules in play:** Plop is generator #1 of three (`feature`, `domain`, `mock`). The same
> command shape works for all: `npm run gen <generator> <name>`. See "Adding things" in
> [`AGENTS.md`](../../AGENTS.md).

---

**Next →** [02 — Customize the Page](./02-customize-the-page.md)
