import { useEffect, type ReactNode } from 'react'

import { useThemeStore, type ThemeMode } from '@/shared/store'

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

// Resolve the chosen mode to a concrete light/dark and toggle `.dark` on <html> — that drives
// every `dark:` utility and CSS variable in globals.css (plan §4.6).
const applyTheme = (mode: ThemeMode): void => {
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

/**
 * Reflects `theme-store` onto the document. Re-applies whenever the mode changes and, while in
 * `system` mode, follows live OS theme changes. The store is the single source of truth; this
 * provider is the one place that mutates the DOM.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    applyTheme(mode)
    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  return children
}
