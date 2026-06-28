import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// React Compiler is wired in Phase 1 (adds @rolldown/plugin-babel); see plan §4.7.
// `@/*` path aliases resolve via Vite 8's native tsconfigPaths (no plugin needed).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react(), tailwindcss()],
})
