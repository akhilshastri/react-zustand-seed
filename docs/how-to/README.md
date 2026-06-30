# How-To Series

A hands-on path through the React Zustand Seed, **basic → advanced**. Each guide is a single
focused task; together they read as one continuous build. We carry a running example through the
whole series: an **`invoices`** feature backed by an **`invoice`** domain entity, mocked, routed,
and role-gated.

These guides show you _how_ to use the seed. The _why_ behind each rule lives in
[`AGENTS.md`](../../AGENTS.md) and the [ADRs](../adr/) — guides link out rather than repeat them.

> **New here?** Start at [00 — Get Started](./00-get-started.md) and go in order. Each guide ends
> with a link to the next.

## Tier 1 — Basics: from clone to a working feature

| #   | Guide                                                    | You'll be able to…                                         |
| --- | -------------------------------------------------------- | ---------------------------------------------------------- |
| 00  | [Get Started](./00-get-started.md)                       | Run the app, sign in, and read the folder map.             |
| 01  | [Generate a Feature](./01-generate-a-feature.md)         | Scaffold a full vertical slice with one command.           |
| 02  | [Customize the Page](./02-customize-the-page.md)         | Edit the generated component and use the shared UI kit.    |
| 03  | [Create a Domain Entity](./03-create-a-domain-entity.md) | Add a Zod schema + type and wire it into the feature.      |
| 04  | [Wire Routing](./04-wire-routing.md)                     | Make the feature reachable with a typed, code-split route. |
| 05  | [Mock the Backend](./05-mock-the-backend.md)             | Shape realistic mock data and enforce authorization.       |

## Tier 2 — Core patterns: state, data, forms, grids

| #   | Guide                                                          | You'll be able to…                                        |
| --- | -------------------------------------------------------------- | --------------------------------------------------------- |
| 06  | [Client State with Zustand](./06-client-state-zustand.md)      | Build UI stores with the factory, selectors, persistence. |
| 07  | [Server State with TanStack Query](./07-server-state-query.md) | Fetch, cache, mutate, and invalidate server data.         |
| 08  | [Forms with RHF + Zod](./08-forms-rhf-zod.md)                  | Validate forms with a domain schema the API reuses.       |
| 09  | [The DataGrid](./09-data-grid.md)                              | Render a server-driven, virtualized table.                |

## Tier 3 — Advanced: auth, reactions, routing, ship

| #   | Guide                                                    | You'll be able to…                                       |
| --- | -------------------------------------------------------- | -------------------------------------------------------- |
| 10  | [Auth & RBAC](./10-auth-and-rbac.md)                     | Protect routes and gate UI by role.                      |
| 11  | [Cross-Store Reactions](./11-cross-store-reactions.md)   | Wire app-wide reactions in `app/bindings.ts`.            |
| 12  | [Advanced Routing](./12-advanced-routing.md)             | Nest layouts, code-split, gate, and parameterize routes. |
| 13  | [Theming & the PWA Shell](./13-theming-and-pwa.md)       | Drive theming and the installable PWA from stores.       |
| 14  | [Testing Your Feature](./14-testing-your-feature.md)     | Test with Vitest + RTL + MSW and Playwright.             |
| 15  | [Connect a Real Backend](./15-connect-a-real-backend.md) | Swap MSW for a live API.                                 |

---

_The seed's architecture in one line: **`app → features → shared → domain`**, server state in
TanStack Query, client state in Zustand, MSW as the entire backend._
