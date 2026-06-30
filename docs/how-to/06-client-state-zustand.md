# 06 — Client State with Zustand

Goal: manage **client/UI/session** state with Zustand the way the seed does — through the shared
`createStore` factory, with narrow selectors and named actions. The golden rule from guide 00
applies here: **never put server data in a store** (that's TanStack Query's job — guide 07).

## The store factory

Every store is built with `createStore` from `src/shared/store`, so they all share one middleware
stack: **devtools** (named, dev-only) → **immer** (mutable `set` recipes). You don't wire
middleware per store; the factory does it.

```ts
import { createStore, type StoreInitializer } from '@/shared/store'

interface CounterState {
  count: number
  increment: () => void
}

const initializer: StoreInitializer<CounterState> = (set) => ({
  count: 0,
  increment: () =>
    set(
      (s) => {
        s.count += 1 // immer: mutate the draft directly
      },
      false, // `replace` flag — keep false to merge
      'counter/increment', // devtools action label
    ),
})

export const useCounterStore = createStore<CounterState>('counter', initializer)
```

Three conventions to copy:

- **Actions are methods on the state**, not external functions. State and behavior live together.
- **`set` takes an immer recipe** — assign to the draft (`s.count += 1`); no spreading.
- **The third `set` argument is a devtools label** (`'counter/increment'`). It makes the Redux
  DevTools timeline readable. Always name your actions.

## Select narrow slices

Subscribe to the smallest piece you need. One value per selector call → the component re-renders
only when _that_ value changes:

```ts
const count = useCounterStore((s) => s.count) // re-renders on count change only
const increment = useCounterStore((s) => s.increment) // action identity is stable
```

Selecting **several** values at once returns a new object each render, which would over-render.
Wrap the selector in `useShallow` (the seed's `users-page.tsx` does exactly this):

```ts
import { useShallow } from 'zustand/react/shallow'

const { globalFilter, sorting, pagination } = useUsersStore(
  useShallow((s) => ({
    globalFilter: s.globalFilter,
    sorting: s.sorting,
    pagination: s.pagination,
  })),
)
```

Outside React, read or write without subscribing via `useCounterStore.getState()` — this is how
`app/bindings.ts` reacts to changes (guide 11).

## Persisted stores

To survive reloads, use `createPersistedStore` and `partialize` to choose what's stored. The
theme store (`src/shared/store/theme-store.ts`) persists only `mode`:

```ts
export const useThemeStore = createPersistedStore<ThemeState, Pick<ThemeState, 'mode'>>(
  'theme',
  initializer,
  { partialize: (state) => ({ mode: state.mode }) },
)
```

## What belongs here (and what doesn't)

✅ Client-only state: UI toggles, selections, filters/sort/pagination, theme, session status.
The seed's `ui-store` (sidebar, offline, update-available) and each feature's view store are good
models.

❌ **Server data.** Lists of users, an invoice record, anything fetched from the API — that lives
in the TanStack Query cache, never copied into Zustand. Mirroring it creates two sources of truth
that drift. (See [ADR-0001](../adr/0001-state-separation.md).)

> **Rules in play:** stores **must not import each other** — cross-store reactions live only in
> `app/bindings.ts` (guide 11). Generate a feature's store with `npm run gen feature` so it
> follows this shape. ([`AGENTS.md`](../../AGENTS.md) §1–2.)

---

**Next →** [07 — Server State with TanStack Query](./07-server-state-query.md)
