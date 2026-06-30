# 05 — Mock the Backend

Goal: turn the generated placeholder handler into a realistic endpoint — backed by seed data,
server-driven, and **authorization-enforced**. In this seed, [MSW](https://mswjs.io) _is_ the
backend: the same handlers serve the dev Service Worker, the Vitest `setupServer`, and Playwright.
(See [ADR-0002](../adr/0002-msw-as-the-backend.md).)

## What the generator gave you

`src/mocks/handlers/invoices.ts`:

```ts
import { http, HttpResponse } from 'msw'

const invoicess = [
  { id: '1', name: 'First item' },
  { id: '2', name: 'Second item' },
]

export default [http.get('/api/invoices', () => HttpResponse.json(invoicess))]
```

It **default-exports an array of handlers** and is auto-collected by
`src/mocks/handlers/index.ts` via `import.meta.glob` — adding a resource means adding a file, with
no registry to edit. Handlers are matched at the real path (`/api/invoices`); the client's `http`
helper adds the `/api` prefix.

## Step 1 — Seed real data

Put fixtures in the in-memory `src/mocks/db.ts` so every handler (and `resetDb()` between tests)
shares one source of truth, mirroring how `users` is seeded:

```ts
// src/mocks/db.ts
export interface DbInvoice {
  id: string
  number: string
  customer: string
  amountCents: number
  status: 'draft' | 'sent' | 'paid' | 'void'
  issuedAt: string
}

const seedInvoices = (): DbInvoice[] => [
  {
    id: 'inv_1',
    number: 'INV-1001',
    customer: 'Acme',
    amountCents: 12000,
    status: 'paid',
    issuedAt: '2026-01-05',
  },
  {
    id: 'inv_2',
    number: 'INV-1002',
    customer: 'Globex',
    amountCents: 9900,
    status: 'sent',
    issuedAt: '2026-02-01',
  },
]

export const db = {
  // ...existing fields,
  invoices: seedInvoices(),
}
// add `db.invoices = seedInvoices()` inside resetDb() too
```

## Step 2 — Make the handler real

Read from `db`, support query params, and return the domain shape:

```ts
import { http, HttpResponse } from 'msw'
import { db } from '../db'

export default [
  http.get('/api/invoices', ({ request }) => {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const rows = q ? db.invoices.filter((i) => i.customer.toLowerCase().includes(q)) : db.invoices
    return HttpResponse.json(rows)
  }),
]
```

## Step 3 — Enforce authorization

A mock that says yes to everyone teaches the wrong lesson. Protected resources must check
permissions and return **`403`** — the same way `src/mocks/handlers/users.ts` does, using the
`requirePermission` helper:

```ts
import { requirePermission } from '../auth-context'

http.get('/api/invoices', ({ request }) => {
  const auth = requirePermission(request, 'invoices:read')
  if (auth instanceof Response) return auth // 401/403 short-circuit
  // ...return rows
})
```

The API is the **real** authority. Client-side `<Can>` and `<RequireRole>` (guide 10) only hide
UI; they are not security. (See [ADR-0005](../adr/0005-auth-security-defaults.md).)

> For write endpoints, follow the `users` handler pattern: validate the body with the domain's
> input schema (`invoiceInputSchema.safeParse(await request.json())`), return `422` on failure,
> mutate `db`, and return the created/updated row. Keep dev and test behavior identical.

## A standalone handler

Need a mock for a resource that isn't a full feature? Generator #3:

```bash
npm run gen mock payments     # → src/mocks/handlers/payments.ts (auto-wired)
```

> **Rules in play:** MSW is the only backend; handlers live in `src/mocks/handlers` + `db.ts` and
> are shared by dev and tests. Protected handlers enforce authz (`403`). Add a handler whenever
> you add an endpoint. ([`AGENTS.md`](../../AGENTS.md) §4.)

---

**Next →** 06 — Client State with Zustand _(coming soon)_
