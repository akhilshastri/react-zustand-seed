import { env } from '@/shared/config/env'

// Phase 0 baseline shell. Providers, router, and layouts arrive in Phase 1 (plan §4).
export const App = () => {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 text-zinc-900">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">{env.VITE_APP_NAME}</h1>
        <p className="text-sm text-zinc-500">Phase 0 baseline — ready to build.</p>
      </div>
    </main>
  )
}
