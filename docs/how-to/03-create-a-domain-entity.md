# 03 — Create a Domain Entity

Goal: replace the feature's placeholder `Invoices` type with a real, validated **domain entity** —
a Zod schema plus its inferred type — and use it across the slice. The `domain/` layer is the one
place a model's shape is defined, so the form, the API parser, and the UI all agree.

## Generate the entity

```bash
npm run gen domain invoice
```

This is generator #2. It creates two files:

```
src/domain/invoice/
├── invoice.ts      # Zod schema + inferred type
└── index.ts        # barrel
```

`invoice.ts` starts as a minimal schema:

```ts
import { z } from 'zod'

export const invoiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
})

export type Invoice = z.infer<typeof invoiceSchema>
```

## Model the real shape

Edit the schema to describe an actual invoice. Define the type **once**, infer it, never write a
parallel `interface`:

```ts
import { z } from 'zod'

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'void'])

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string().min(1),
  customer: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  status: invoiceStatusSchema,
  issuedAt: z.string(), // ISO date
})

export type Invoice = z.infer<typeof invoiceSchema>
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>
```

For a create/edit form, add a separate **input** schema (the subset the user fills in) — the
pattern the seed's `domain/user/user.ts` uses with `userInputSchema`:

```ts
export const invoiceInputSchema = invoiceSchema.pick({
  number: true,
  customer: true,
  amountCents: true,
})

export type InvoiceInput = z.infer<typeof invoiceInputSchema>
```

## Register the barrel

The generator prints a reminder to export your entity from the domain root. Add it to
`src/domain/index.ts`:

```ts
export * from './invoice'
```

Now anything can import the type from the public surface:

```ts
import { invoiceSchema, type Invoice } from '@/domain/invoice'
```

## Use it in the feature

Point the feature's API hook at the domain type instead of the placeholder. In
`src/features/invoices/api/use-invoices-list.ts`:

```ts
import { type Invoice } from '@/domain/invoice'

export const useInvoicesList = () =>
  useQuery({
    queryKey: invoicesKeys.lists(),
    queryFn: () => http.get<Invoice[]>('/invoices'),
  })
```

You can now delete the placeholder `src/features/invoices/types/invoices.types.ts` and import
`Invoice` from the domain everywhere the slice referenced the old type.

> **Rules in play:** `domain/` is **framework-agnostic and imports nothing** from `app`,
> `features`, or `shared` — it's pure models. Schemas defined here are reused for forms (guide 08)
> and response parsing, so validation is never duplicated.
> (See [ADR-0001](../adr/0001-state-separation.md) and [`AGENTS.md`](../../AGENTS.md) §6.)

---

**Next →** [04 — Wire Routing](./04-wire-routing.md)
