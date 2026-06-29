# 0005 — Auth security defaults

**Status:** Accepted

## Context

A seed encodes the defaults others copy into production, so the defaults here must be the **safe**
ones, not the convenient ones. The common anti-patterns — tokens in `localStorage`, client-only
RBAC treated as security, naive 401 handling — must not be what this app teaches.

## Decision

- **Access token in memory only** (a module variable in `shared/api/auth-token.ts`) — never
  `localStorage`, keeping it off the XSS token-theft surface.
- **Refresh token as an httpOnly, `SameSite=Strict` cookie** (MSW-simulated). JS never reads it;
  the browser/MSW sends it automatically. On a cold start the app calls `/auth/refresh` to
  re-hydrate the access token.
- **Persisted Zustand holds only non-sensitive session info** (user id, name, roles) for instant
  UI — never tokens.
- **Single-flight 401 refresh** — concurrent 401s await one shared in-flight refresh promise, then
  retry once with the new token (no refresh storm).
- **Authorization is enforced at the API.** The MSW handlers return `403`; client `<Can>` /
  `<RequireRole>` are **UX-only** (the code is already in the bundle — hiding a button is not
  security).

## Consequences

- A page reload always re-validates the session via the refresh cookie; status starts `unknown`
  until that resolves.
- The mock refresh cookie round-trips through MSW's cookie store and is invisible to
  `document.cookie` (verified) — the same property a real httpOnly cookie has.
- Anything startup-time that calls the backend (the bootstrap refresh) must run **after** MSW is
  ready, not at module-eval — otherwise it races the mock backend and wipes the session.
