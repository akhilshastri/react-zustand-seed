# 0001 — State separation: TanStack Query vs Zustand

**Status:** Accepted

## Context

There are two distinct kinds of state. **Server state** is fetched, shared, cached, and can go
stale (it lives on the backend). **Client state** is local and synchronous (UI toggles, session,
form-adjacent view state). Conflating them — e.g. storing fetched data in a Zustand store — forces
manual cache synchronisation and breeds staleness bugs.

## Decision

- **TanStack Query owns all server state** — anything fetched through the REST/MSW layer.
  Caching, refetching, and invalidation are its job. Mutations invalidate query keys; we never
  hand-write fetched data into a store.
- **Zustand owns client/UI/session state only** — auth session (non-sensitive), theme, sidebar,
  the grid's filter/sort/selection view state.
- **Never mirror server data into a Zustand store.**

## Consequences

- Components select narrow slices from each source. Server data has one cache; UI state has one
  store.
- The users grid keeps its filter/sort/page in Zustand but its rows in the Query cache; writes
  invalidate `userKeys.all` rather than patching a store.
- The boundary is a review rule, not a lint rule — keep it deliberately.
