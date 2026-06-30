# 08 — Forms with React Hook Form + Zod

Goal: build a validated form with React Hook Form + Zod using the seed's `useZodForm` helper and
`FormField` component. The validation schema lives in `domain/` and is reused for both the form
**and** the API request — one source of truth.

## One schema, defined in the domain

Put the input schema next to its entity in `src/domain/**` (guide 03). The seed's `user.ts` has a
dedicated input schema — the subset the user fills in:

```ts
// src/domain/user/user.ts
export const userInputSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.email('Enter a valid email'),
  role: roleSchema,
})

export type UserInput = z.infer<typeof userInputSchema>
```

The same `userInputSchema` validates the form here and the request body in the MSW handler
(guide 05). Validation is never written twice.

## `useZodForm`

`src/shared/forms/use-zod-form.ts` is `useForm` pre-wired with a Zod resolver. Pass the schema;
value and error types are inferred from it:

```ts
import { userInputSchema } from '@/domain/user'
import { FormField, useZodForm } from '@/shared/forms'

const form = useZodForm(userInputSchema, {
  defaultValues: { name: '', email: '', role: 'viewer' },
})
```

## `FormField`

`FormField` wraps a shadcn `Input` + `Label` with inline error display and the matching
`aria-invalid` / `aria-describedby` wiring. Bind it with `form.control` and a field `name`:

```tsx
<FormField control={form.control} name="name" label="Name" placeholder="Ada Lovelace" />
<FormField control={form.control} name="email" label="Email" type="email" />
```

For composite inputs (a `<select>`, checkbox, custom control), drop to RHF's `Controller`
directly — the same pattern `FormField` is built on. The user dialog does this for the role
select.

## Submit → mutate

`handleSubmit` only runs when the schema passes, and its argument is the parsed, typed output.
Hand it straight to a mutation (guide 07). From the seed's `UserFormDialog`:

```tsx
const createUser = useCreateUser()
const updateUser = useUpdateUser()

const onSubmit = form.handleSubmit((values) => {
  const onSuccess = () => onClose()
  if (user) updateUser.mutate({ id: user.id, input: values }, { onSuccess })
  else createUser.mutate(values, { onSuccess })
})
```

Two more patterns worth copying from that dialog:

- **Reset on open.** A create/edit dialog calls `form.reset(...)` in an effect keyed on the open
  state and the subject, so reopening starts clean (or pre-filled for edit).
- **Surface server errors.** Render `createUser.error ?? updateUser.error` near the submit button
  — validation catches bad input; the mutation error catches a rejected request (e.g., a `422`
  from the handler).

## Why schema-first matters

Because the schema is the contract, a field added to `userInputSchema` shows up as a typed form
value, a validated request body, and a parse point for responses — all at once. No drift between
"what the form allows" and "what the API accepts." (See [ADR-0001](../adr/0001-state-separation.md).)

> **Rules in play:** forms = RHF + Zod via `use-zod-form`; schemas live in `src/domain/**` and are
> reused, never duplicated. ([`AGENTS.md`](../../AGENTS.md) §6.)

---

**Next →** [09 — The DataGrid](./09-data-grid.md)
