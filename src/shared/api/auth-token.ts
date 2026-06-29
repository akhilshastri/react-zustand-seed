/**
 * In-memory access-token holder.
 *
 * The access token lives in a module variable and **never** touches `localStorage` — that
 * keeps it off the XSS token-theft surface (plan §4.6). The refresh token is an httpOnly
 * cookie (MSW-simulated) the browser sends automatically; JS never reads it.
 *
 * Phase 2's `auth-store` owns the lifecycle (login / refresh / logout) and calls the setters
 * here; `http-client` reads the token to inject the `Authorization` header.
 */
let accessToken: string | null = null

export const getAccessToken = (): string | null => accessToken

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

export const clearAccessToken = (): void => {
  accessToken = null
}
