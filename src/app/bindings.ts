import { queryClient } from '@/app/providers/query-provider'
import { router } from '@/app/router/routes'
import { registerAuthRefresh, useAuthStore } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { useUiStore } from '@/shared/store'

let initialized = false
let tearingDown = false

/**
 * The ONE place cross-cutting reactions are wired (plan §4.9). Reactions use Zustand's own
 * `store.subscribe` + direct calls — no event bus, no store-to-store imports. Subscriptions
 * here are app-lifetime singletons (set up once, never torn down). The guard keeps it idempotent
 * across HMR / double-invocation.
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

  // auth: when the session ends (logout or a failed refresh → unauthenticated), clear the server
  // cache, reset transient UI, and redirect to login (plan §4.9). Re-entrancy-guarded so a
  // session-expired event during teardown can't loop on this security-critical path.
  useAuthStore.subscribe((state, prev) => {
    if (state.status === prev.status) return
    if (state.status !== 'unauthenticated' || tearingDown) return
    tearingDown = true
    try {
      queryClient.clear()
      useUiStore.getState().reset()
      void router.navigate(paths.login)
    } finally {
      tearingDown = false
    }
  })

  // Register 401 recovery with http-client. The cold-start session restore (bootstrapAuth) is
  // NOT called here: setupBindings runs at module-eval, before main.tsx starts MSW, so a refresh
  // fired now would race ahead of the mock backend. AppProviders triggers it after render
  // instead (render is gated on MSW being ready).
  registerAuthRefresh()
}
