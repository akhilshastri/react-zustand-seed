# 02 — Customize the Page

Goal: turn the generated placeholder page into your own UI using the seed's shared component kit.
We'll keep the data wiring the generator gave us and focus on the component.

This is the generated `src/features/invoices/components/invoices-page.tsx` you're starting from:

```tsx
export const InvoicesPage = () => {
  const list = useInvoicesList()
  const selectedId = useInvoicesStore((s) => s.selectedId)
  const setSelectedId = useInvoicesStore((s) => s.setSelectedId)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      {list.isPending ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : list.isError ? (
        <p className="text-destructive text-sm">{list.error.message}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {list.data.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedId(item.id)}>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Three patterns to copy

**1. Select narrow slices from the store.** Subscribe to one value per `useXStore(selector)`
call — not the whole store — so the component only re-renders when that value changes:

```tsx
const selectedId = useInvoicesStore((s) => s.selectedId) // good
const store = useInvoicesStore() // avoid: re-renders on any change
```

**2. Use the shared UI kit, not raw elements.** Primitives live in `src/shared/ui` (shadcn/ui on
Tailwind v4). Swap the bare `<button>` for the seed's `Button`:

```tsx
import { Button } from '@/shared/ui/button'

;<Button variant="outline" size="sm" onClick={() => setSelectedId(item.id)}>
  {item.name}
</Button>
```

Available primitives include `button`, `input`, `label`, `dialog`, and the reusable
`data-grid` (covered in guide 09). Add more with the shadcn CLI — not a generator.

**3. Compose classes with `cn()`.** Use the `cn` helper (clsx + tailwind-merge) for conditional
or merged class names so later utilities win over earlier ones:

```tsx
import { cn } from '@/shared/lib/cn'

;<Button
  variant="ghost"
  className={cn('w-full justify-start', selectedId === item.id && 'font-semibold')}
>
  {item.name}
</Button>
```

## Do not hand-add memoization

**React Compiler is on.** Do **not** add `useMemo`, `useCallback`, or `React.memo` — the compiler
memoizes for you, and `eslint-plugin-react-hooks` will flag violations. Write plain React.
(See [ADR-0003](../adr/0003-react-compiler.md).)

## See it in the shell

Once the route is wired (guide 04), the page renders inside `RootLayout` — the persistent header,
nav, theme toggle, and sign-out — via the router `<Outlet/>`. You only build the page body; the
chrome is already there.

> **Rules in play:** function expressions over declarations (`const Page = () => …`), no `any`,
> small single-purpose components. Full style notes in [`AGENTS.md`](../../AGENTS.md).

---

**Next →** [03 — Create a Domain Entity](./03-create-a-domain-entity.md)
