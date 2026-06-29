# 0002 — MSW is the backend

**Status:** Accepted

## Context

The seed needs a realistic REST API for development and tests without standing up and maintaining
a server.

## Decision

**MSW is the single mock backend.** Request handlers live in `src/mocks/handlers/` and the
in-memory data in `src/mocks/db.ts`, shared across all three runtimes:

- **Dev** — MSW's browser Service Worker (`src/mocks/browser.ts`), started in `main.tsx`.
- **Vitest** — `setupServer` (Node, no service worker; `src/mocks/server.ts`).
- **Playwright** — the browser worker via the dev server (never `setupServer`).

Handlers **enforce authorization** (return `401`/`403`); they are not a yes-man. New `*.ts`
handler files are auto-registered via `import.meta.glob` — no central registry to edit.

## Consequences

- One source of truth for API behaviour, so dev and tests can't drift.
- The built `dist` has **no backend** — it needs a real API to show data (see
  [ADR-0006](0006-installable-shell-pwa.md)).
- Auth tokens are mock-signed, not real crypto (`src/mocks/auth-tokens.ts`).
- Moving to a real API = replace `src/mocks` and point `VITE_API_BASE_URL` at it; the app code
  (http-client, hooks) is unchanged.
