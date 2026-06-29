import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Vitest config (plan §6). Separate from vite.config.ts so tests skip the React Compiler babel
// pass (the compiler is a prod optimization, irrelevant to behavior tests) and Tailwind. The `@`
// alias is set explicitly so it does not depend on Vite's tsconfigPaths resolution under Vitest.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    clearMocks: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
