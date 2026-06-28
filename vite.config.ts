import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// React Compiler runs via @rolldown/plugin-babel because @vitejs/plugin-react v6 dropped its
// internal Babel (JSX + Fast Refresh now run in oxc/Rust). Ordering follows the plugin-react
// README: react() first, then the babel/compiler pass. React 19 uses `react/compiler-runtime`
// (no runtime package needed). See plan §4.7.
//
// `@/*` path aliases resolve via Vite 8's native tsconfigPaths (no plugin needed).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
})
