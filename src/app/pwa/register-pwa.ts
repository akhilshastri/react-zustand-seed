import { registerSW } from 'virtual:pwa-register'

import { useUiStore } from '@/shared/store'

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

/**
 * Register the Workbox service worker and wire its update signal directly into `ui-store` — no
 * event bus (plan §4.8/§4.9). In dev the PWA SW is disabled, so this is a no-op there; in prod it
 * precaches the app shell. On a new build, `onNeedRefresh` flips the update toast rather than
 * silently reloading.
 */
export const registerPwa = (): void => {
  updateSW = registerSW({
    onNeedRefresh() {
      useUiStore.getState().showUpdateToast()
    },
    onOfflineReady() {
      // App shell is cached and ready offline. Data still needs a real API (no offline data).
    },
  })
}

/** Activate the waiting service worker and reload (called from the update toast). */
export const applyUpdate = (): void => {
  void updateSW?.(true)
}
