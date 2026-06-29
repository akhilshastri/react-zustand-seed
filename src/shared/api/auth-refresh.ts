type RefreshHandler = () => Promise<boolean>

let handler: RefreshHandler | null = null
let inFlight: Promise<boolean> | null = null

/**
 * Register how a 401 is recovered. The auth feature wires this at bootstrap (feature → shared),
 * keeping `http-client` decoupled from `auth-store` (the dependency direction in §3).
 */
export const setRefreshHandler = (fn: RefreshHandler | null): void => {
  handler = fn
}

/**
 * Single-flight refresh: every concurrent 401 awaits ONE shared refresh attempt, then retries.
 * Without this, N simultaneous 401s fire N refreshes and retry with a stale token — the classic
 * JWT refresh-storm bug (plan §4.6, §9). Resolves `false` when no handler is registered or the
 * refresh fails.
 */
export const runRefresh = (): Promise<boolean> => {
  if (!handler) return Promise.resolve(false)
  inFlight ??= handler().finally(() => {
    inFlight = null
  })
  return inFlight
}
