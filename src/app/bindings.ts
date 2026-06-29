import { useUiStore } from '@/shared/store'

let initialized = false

/**
 * The ONE place cross-cutting reactions are wired (plan §4.9). Reactions use Zustand's own
 * `store.subscribe` + direct calls — no event bus, no store-to-store imports. Subscriptions
 * here are app-lifetime singletons (set up once, never torn down), so there is no
 * unsubscribe-leak surface. The guard keeps it idempotent across HMR / double-invocation.
 */
export const setupBindings = (): void => {
  if (initialized) return
  initialized = true

  // online/offline -> ui-store (plan §4.8). Banner only — going offline does not make data
  // calls succeed; there is no real backend behind a built `dist`.
  const syncOnline = () => useUiStore.getState().setOffline(!navigator.onLine)
  syncOnline()
  window.addEventListener('online', syncOnline)
  window.addEventListener('offline', syncOnline)

  // Phase 2 (auth): when auth-store transitions to 'unauthenticated', clear the query cache,
  // reset transient UI, and redirect to login. Wired right here, the same way (§4.9):
  //
  //   import { queryClient } from '@/app/providers/query-provider'
  //   import { router } from '@/app/router/routes'
  //   import { paths } from '@/app/router/paths'
  //   import { useAuthStore } from '@/features/auth'
  //
  //   useAuthStore.subscribe(
  //     (s) => s.status,
  //     (status) => {
  //       if (status !== 'unauthenticated') return
  //       queryClient.clear()
  //       useUiStore.getState().reset()
  //       void router.navigate(paths.login)
  //     },
  //   )
  //
  // The teardown reaction must be idempotent + re-entrancy-guarded so a session-expired event
  // during logout can't loop on the security-critical path (§4.9).
}
