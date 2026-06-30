# 00 — Get Started

Goal: clone the seed, get it running, sign in, and learn where things live. Five minutes.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

Requirements: **Node `>=20`** and npm. There is no `.env` to set —
`src/shared/config/env.ts` Zod-parses `import.meta.env` and supplies safe defaults (the API base
defaults to `/api`). Copy `.env.example` to `.env` only if you want to override a value.

There is **no real backend**. [MSW](https://mswjs.io) mocks the entire REST API for both dev and
tests, so the app is fully interactive the moment it boots. (See
[ADR-0002](../adr/0002-msw-as-the-backend.md).)

## Sign in

Every seeded account uses the password `password`:

| Email                 | Role    | Can                                   |
| --------------------- | ------- | ------------------------------------- |
| `admin@example.com`   | admin   | read / create / update / delete users |
| `manager@example.com` | manager | read / create / update users          |
| `viewer@example.com`  | viewer  | read users only                       |

Sign in as `admin@example.com` to see everything, including the role-gated **Users** grid and
**Admin** page.

## The folder map

The seed is **Feature-Sliced** with a one-way dependency rule:
**`app → features → shared → domain`**. `domain` imports nothing.
(See [ADR-0007](../adr/0007-feature-sliced-architecture.md).)

```
src/
├── app/        composition root: providers, router (+ guards), layouts, error, pwa, bindings.ts
├── domain/     framework-agnostic models + Zod schemas (auth, user, rbac)
├── features/   vertical slices (auth, users, home, admin): api/ components/ store/ hooks/ types/
├── shared/     api (http-client, query-client), store (createStore), ui (shadcn + data-grid),
│               forms, config (env, paths), lib, hooks
├── mocks/      MSW — handlers, db fixtures, browser + server setup   ← the backend
└── test/       Vitest setup + provider-aware render()
```

Two ideas do most of the work, and the rest of this series builds on them:

- **State separation.** Server data → TanStack Query. Client/UI/session state → Zustand. Never
  copy server data into a store. ([ADR-0001](../adr/0001-state-separation.md))
- **You scaffold, you don't hand-roll.** New features, domain entities, and mock handlers are
  generated so structure stays identical across the codebase.

> **Rules in play:** the full operating manual is [`AGENTS.md`](../../AGENTS.md). Skim "The rules
> that matter" once before you start building — it will save you a review cycle later.

---

**Next →** [01 — Generate a Feature](./01-generate-a-feature.md)
