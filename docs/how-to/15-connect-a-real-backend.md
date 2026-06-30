# 15 — Connect a Real Backend

Goal: graduate off MSW and point the app at a real API. The seed is **MSW-only** by design (guide
05), but the client is built so the swap is mostly configuration — the `http` layer already does
the hard parts.

## What's already done for you

`src/shared/api/http-client.ts` is a real `fetch` wrapper, not a mock. For every request it:

- prefixes `env.VITE_API_BASE_URL`,
- injects the in-memory access token as `Authorization: Bearer …` (guide 10),
- sends cookies (`credentials: 'include'`) so an httpOnly refresh cookie flows,
- parses JSON and throws `ApiError` on any non-2xx,
- on a `401`, runs a **single-flight refresh** and retries the request once.

If your API matches the seed's contract, you mostly just change the base URL.

## Step 1 — Point at the API

`VITE_API_BASE_URL` defaults to `/api` (`src/shared/config/env.ts`). Override it in `.env`:

```bash
# .env
VITE_API_BASE_URL=https://api.example.com
```

Now `http.get('/users')` resolves to `https://api.example.com/users`.

## Step 2 — Turn off the mock backend

MSW is **already excluded from production** — `main.tsx` only starts the worker under
`import.meta.env.DEV`, and the dynamic import is tree-shaken from the prod bundle. So a real
`npm run build` already talks to your API.

To develop against the real API too, stop the dev worker from starting — either gate it behind a
flag or remove the mocks:

```ts
// main.tsx — gate mocking behind an opt-in flag instead of plain DEV
const enableMocking = async () => {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MSW === 'false') return
  const { worker } = await import('@/mocks/browser')
  await worker.start(/* … */)
}
```

When you've fully cut over, delete `src/mocks/**` and the `setup.ts` MSW wiring (and rewrite tests
to mock at the boundary you prefer).

## Step 3 — Match the auth contract (or adapt it)

The seed expects a specific, secure auth shape. Your API should either match it or you adapt the
thin `shared/api` layer:

- **Login** returns an access token (kept in memory via `setAccessToken`) and sets the **refresh
  token as an httpOnly cookie**. The client never reads the refresh token.
- **`401`** means "access token expired" → the client calls the registered refresh handler
  (`setRefreshHandler` / `runRefresh`) once, then retries.
- **`403`** means "authenticated but not allowed" — surfaced as an `ApiError`, not a refresh.
- **Cold start** calls `bootstrapAuth()` once after render to silently restore the session.

If your backend differs (header-based refresh, different paths, different status semantics), change
it in `auth-refresh.ts` / `auth-token.ts` / the auth feature — not scattered through components.

## Step 4 — Mind the mock-only shortcuts

- The seed's tokens are **mock-signed, not real crypto** (`src/mocks/auth-tokens.ts`). A real
  backend issues real JWTs — nothing client-side changes, but don't carry the mock signing over.
- Keep the architecture: server data stays in TanStack Query (guide 07), the query-key factory and
  state-separation law are unchanged. You're swapping the _source_, not the patterns.

> **Rules in play:** the seed ships no real backend — replacing `src/mocks` and setting
> `VITE_API_BASE_URL` is the supported path to a live API. ([`AGENTS.md`](../../AGENTS.md), Notes /
> scope; [ADR-0002](../adr/0002-msw-as-the-backend.md).)

---

🎉 **That's the series.** You've gone from cloning the seed to running it against a real backend.
Back to the [overview](./README.md).
