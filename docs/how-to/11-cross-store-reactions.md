# 11 — Cross-Store Reactions

Goal: make one store (or external event) trigger an effect in another part of the app — **without**
coupling stores together. The seed has exactly one place for this: `src/app/bindings.ts`. No event
bus, no store importing another store.

## The problem it solves

Stores are independent and **must not import each other** (guide 06). But real apps need
cross-cutting reactions: "when the session ends, clear the server cache and redirect." If stores
called each other directly you'd get a dependency tangle and circular imports. The seed's answer:
wire those reactions in one app-level file using Zustand's own `store.subscribe`.

`app/` is allowed to import features + shared, so `bindings.ts` can see everything; the stores
themselves stay decoupled.

## The shape of `bindings.ts`

```ts
export const setupBindings = (): void => {
  if (initialized) return
  initialized = true

  // 1. Browser event → store
  const syncOnline = () => useUiStore.getState().setOffline(!navigator.onLine)
  syncOnline()
  window.addEventListener('online', syncOnline)
  window.addEventListener('offline', syncOnline)

  // 2. Store change → cross-cutting effect
  useAuthStore.subscribe((state, prev) => {
    if (state.status === prev.status) return
    if (state.status !== 'unauthenticated' || tearingDown) return
    tearingDown = true
    try {
      queryClient.clear() // drop all server cache
      useUiStore.getState().reset() // reset transient UI
      void router.navigate(paths.login)
    } finally {
      tearingDown = false
    }
  })

  // 3. Register transport-level hooks
  registerAuthRefresh()
}
```

Three patterns are visible: a **browser event** feeding a store, a **store subscription** driving
effects in other systems (Query cache, UI store, router), and **transport registration**.

## How to add a binding

1. Open `app/bindings.ts`.
2. Subscribe to the source store and call the target directly via `getState()`:

```ts
useThemeStore.subscribe((state, prev) => {
  if (state.mode === prev.mode) return
  // react to a theme change — call any store/service directly
})
```

3. That's it. Do **not** import one store into another, and do **not** add a `subscribe` call
   inside a component for cross-store logic.

## Two safety rules these subscriptions follow

- **Idempotent setup.** The `initialized` guard means `setupBindings()` wires once even across HMR
  or double-invocation. Subscriptions here are app-lifetime singletons (never torn down).
- **Re-entrancy guards on critical paths.** The auth teardown sets `tearingDown` so a
  session-expired event _during_ teardown can't loop on this security-sensitive path. Any binding
  that can re-trigger itself needs a guard like this.

## When NOT to use a binding

If the reaction belongs to a single component's lifecycle (subscribe while mounted, clean up on
unmount), keep it in that component with `useEffect`. `bindings.ts` is only for **app-wide,
cross-store** reactions that outlive any component.

> **Rules in play:** cross-store reactions live **only** in `app/bindings.ts`, via `store.subscribe`
>
> - direct calls — no event bus, no store-to-store imports, no ad-hoc `subscribe` in components.
>   (See [ADR-0004](../adr/0004-cross-store-direct-bindings.md) and [`AGENTS.md`](../../AGENTS.md) §2.)

---

**Next →** [12 — Advanced Routing](./12-advanced-routing.md)
