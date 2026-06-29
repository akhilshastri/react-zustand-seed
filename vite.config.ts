import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Drop the MSW worker from the production build (plan §4.8). It is needed in dev (MSW's own
// service worker), but in `dist` only the Workbox SW should exist — never two SWs at one scope.
// (Nothing registers it in prod anyway, since main.tsx gates MSW behind import.meta.env.DEV.)
const excludeMswWorkerFromBuild = (): Plugin => ({
  name: 'exclude-msw-worker-from-build',
  apply: 'build',
  closeBundle() {
    const file = resolve(process.cwd(), 'dist/mockServiceWorker.js')
    if (existsSync(file)) rmSync(file)
  },
})

// https://vite.dev/config/
//
// React Compiler runs via @rolldown/plugin-babel because @vitejs/plugin-react v6 dropped its
// internal Babel (JSX + Fast Refresh now run in oxc/Rust). Ordering follows the plugin-react
// README: react() first, then the babel/compiler pass. React 19 uses `react/compiler-runtime`.
// See plan §4.7. `@/*` path aliases resolve via Vite 8's native tsconfigPaths.
//
// PWA (plan §4.8): installable app-shell only. Workbox `generateSW` precaches the built shell +
// static assets; API responses are NOT service-worker cached (TanStack Query owns server state).
// `registerType: 'prompt'` → we surface an update toast (no silent reload). `devOptions.enabled:
// false` keeps the PWA SW off in dev so MSW's SW serves mocked data.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'React Zustand Seed',
        short_name: 'RZ Seed',
        description: 'Enterprise React seed — Zustand, TanStack Query, React Router, MSW.',
        theme_color: '#18181b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
        globIgnores: ['**/mockServiceWorker.js'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
    excludeMswWorkerFromBuild(),
  ],
})
