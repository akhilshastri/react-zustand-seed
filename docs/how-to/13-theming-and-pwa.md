# 13 — Theming & the PWA Shell

Goal: understand the two app-shell systems the seed ships — light/dark theming and the installable
PWA — and how to work with them. Both are driven by stores, not scattered DOM code.

## Theming: store → `<html>` class

Three pieces, one source of truth (`theme-store`):

1. **`theme-store`** — a persisted Zustand store holding `mode: 'light' | 'dark' | 'system'`. Only
   `mode` is persisted, so the choice survives reloads (guide 06).
2. **`ThemeProvider`** (`app/providers`) — the **one** place that touches the DOM. It resolves the
   mode to concrete light/dark and toggles `.dark` on `<html>`, which drives every `dark:` utility
   and CSS variable in `globals.css`. In `system` mode it also follows live OS theme changes via
   `matchMedia`.
3. **`ThemeToggle`** (`shared/ui`) — cycles `light → dark → system`.

To set the theme from anywhere, just write to the store — the provider reacts:

```ts
useThemeStore.getState().setMode('dark')
```

Add a new theme dimension (e.g., an accent color) by extending the store and reading it in the
provider — never by toggling classes ad hoc in components.

## PWA: installable shell, no offline data

The PWA is configured in `vite.config.ts` via `vite-plugin-pwa` (Workbox `generateSW`). Key
choices, each deliberate:

- **`registerType: 'prompt'`** — on a new build the app shows an update toast instead of silently
  reloading.
- **Precache the shell, never API data.** Workbox precaches built JS/CSS/HTML/SVG/fonts; API
  responses are **not** service-worker cached — TanStack Query owns server state. (This is why the
  built app is an installable shell with no offline data.)
- **One service worker per scope.** MSW's SW runs in dev; the Workbox SW ships in prod. The build
  even deletes the MSW worker from `dist` so the two never collide. `devOptions.enabled: false`
  keeps the PWA SW off in dev.

### How the update/offline UX is wired

This reuses the store + bindings patterns (guides 06, 11) — no event bus:

- `register-pwa.ts` registers the SW and, on `onNeedRefresh`, calls
  `useUiStore.getState().showUpdateToast()`.
- The online/offline binding in `app/bindings.ts` sets `ui-store.isOffline`.
- `PwaPrompts` renders the offline banner and the "new version → Reload" toast purely from
  `ui-store`. `applyUpdate()` activates the waiting SW and reloads.

## Test it the right way

The PWA only exists in a production build. Don't expect it in `npm run dev`:

```bash
npm run build && npm run preview   # install prompt, offline shell, update flow
```

(See [ADR-0006](../adr/0006-installable-shell-pwa.md).)

> **Rules in play:** never let the service worker runtime-cache API responses (Query owns that);
> only one SW per scope. ([`AGENTS.md`](../../AGENTS.md) §8.)

---

**Next →** [14 — Testing Your Feature](./14-testing-your-feature.md)
