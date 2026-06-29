import { useUiStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'

import { applyUpdate } from './register-pwa'

/**
 * App-wide PWA prompts driven entirely by `ui-store` (plan §4.8): an offline banner (set by the
 * online/offline binding in app/bindings.ts) and a "new version" update toast (set by
 * register-pwa's onNeedRefresh). Banner only — going offline does not make data calls succeed.
 */
export const PwaPrompts = () => {
  const isOffline = useUiStore((s) => s.isOffline)
  const updateAvailable = useUiStore((s) => s.updateAvailable)

  return (
    <>
      {isOffline ? (
        <div
          role="status"
          className="bg-muted text-muted-foreground fixed inset-x-0 top-0 z-50 px-4 py-2 text-center text-sm"
        >
          You’re offline — showing the cached app shell. Live data needs a connection.
        </div>
      ) : null}

      {updateAvailable ? (
        <div
          role="alert"
          className="bg-background fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-md border p-4 shadow-lg"
        >
          <span className="text-sm">A new version is available.</span>
          <Button size="sm" onClick={applyUpdate}>
            Reload
          </Button>
        </div>
      ) : null}
    </>
  )
}
