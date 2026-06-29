# 0007 — Feature-Sliced architecture + dependency direction

**Status:** Accepted

## Context

The app needs module boundaries that scale with features and prevent tangled imports — a clear
answer to "where does this code go?" and "what may import what?".

## Decision

**Feature-Sliced (FSD-lite) with a composition root.** Layers depend **inward only**:

```
app  →  features  →  shared  →  domain
```

- **`domain`** — framework-agnostic models + Zod schemas; depends on nothing.
- **`shared`** — cross-cutting building blocks (http-client, store factory, UI primitives, forms,
  config); may import `domain`, never `features`/`app`.
- **`features`** — vertical slices that own their `api/ components/ store/ hooks/ types/`; import
  other features **only via their public `index.ts`**.
- **`app`** — composition root (providers, router + guards, layouts, `bindings.ts`); may import
  anything.

A shared, persisted, or API-contract concept (`User`, `Role`, route paths) belongs in `domain/` or
`shared/` — not a feature. The Plop scaffolder generates slices in this shape.

## Consequences

- Predictable structure; new code has an obvious home, and the scaffolder keeps it consistent.
- `app/` being the only "imports anything" layer is what lets `bindings.ts` wire cross-store
  reactions and lets route paths live in `shared` (so features don't import `app`).
- The import-boundary is currently a **convention** — the ESLint rule to enforce it is not yet
  enabled (no compatible flat-config plugin was wired); reviewers uphold it.
