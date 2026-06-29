# 0006 — Installable-shell PWA (no offline data)

**Status:** Accepted

## Context

An installable PWA usually implies offline data. But this app's backend is MSW, which is
**dev/test only** — a built `dist` has no API and cannot fetch anything offline _or_ online. We
must not claim offline data we can't deliver.

## Decision

Scope the PWA to **installable + app-shell precache only** (`vite-plugin-pwa`, Workbox
`generateSW`):

- Precache the built **app shell + static assets**; **do not** runtime-cache `/api` — TanStack
  Query owns server-state caching, and SW-caching API data causes stale, confusing results.
- `registerType: 'prompt'` surfaces an **update toast** (wired directly to `ui-store`, no event
  bus) — no silent auto-reload. An offline banner rides the existing `online/offline → ui-store`
  binding.
- **One SW per scope:** MSW's SW in dev, the Workbox SW in prod. A build plugin removes
  `mockServiceWorker.js` from `dist` so only the Workbox SW ships.

## Consequences

- The shell loads offline; **data needs a connection and a real API**. No false "offline data"
  claim.
- The `injectManifest` single-SW path (Workbox **+** MSW in prod, which would make `dist` a
  standalone offline demo) was considered and **rejected** — heavier and out of scope.
- Icons are a hand-authored SVG (binary PNGs can't be produced in this workflow); SVG satisfies
  installability with no native `sharp` dependency. `@vite-pwa/assets-generator` remains the path
  for raster icons in a real product.
