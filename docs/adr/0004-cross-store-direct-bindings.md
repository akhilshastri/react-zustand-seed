# 0004 — Cross-store communication via direct bindings

**Status:** Accepted

## Context

Some reactions cross store boundaries: when auth flips to `unauthenticated`, the Query cache must
clear, `ui-store` must reset, and the app must redirect to login. Wiring this by importing stores
into one another couples them; a typed event bus adds hidden, grep-only control flow for no real
benefit at this scale (a few stores, a couple of reactions).

## Decision

**One wiring file: `app/bindings.ts`.** It lives in `app/` on purpose — the composition root may
import both features and shared, so it can read a feature store and call `queryClient` /
`ui-store` directly without violating the dependency direction. Reactions use Zustand's own
`store.subscribe` (base `(state, prev)` form) + direct function calls. **No event bus.**

Discipline: subscriptions here are **app-lifetime singletons** (set up once, never torn down, no
unsubscribe-leak surface); teardown reactions are **idempotent + re-entrancy-guarded** so a
session-expired-during-logout can't loop on the security-critical path. Components never wire
cross-store `subscribe`.

## Consequences

- All cross-cutting reactions are discoverable in one place and compile-time-checked; no event
  contract to drift.
- Stores stay decoupled (they never import each other). Route paths moved to
  `shared/config/paths.ts` so features navigate by constant without importing `app/`.
- This was an adversarial-review decision (an event bus was the original plan). Revisit a bus only
  if cross-cutting reactions ever become genuinely many-to-many — YAGNI until then.
