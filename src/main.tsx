import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/app'
import { registerPwa } from '@/app/pwa/register-pwa'
import '@/styles/globals.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

// Start the MSW worker before the first render so no request races an unmocked backend.
// Dev only — in production the app talks to a real API (plan §4.8). The dynamic import is
// behind a static DEV guard, so MSW is tree-shaken out of the production bundle.
const enableMocking = async (): Promise<void> => {
  if (!import.meta.env.DEV) return
  const { worker } = await import('@/mocks/browser')
  await worker.start({
    onUnhandledRequest: (request, print) => {
      // Warn only on unhandled API calls (real gaps); ignore Vite/static asset traffic.
      if (new URL(request.url).pathname.startsWith('/api')) print.warning()
    },
  })
}

enableMocking().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  // Register the Workbox SW (prod only; no-op in dev where MSW's SW runs instead). After render
  // so it never competes with first paint.
  registerPwa()
})
