import { Monitor, Moon, Sun } from 'lucide-react'

import { useThemeStore, type ThemeMode } from '@/shared/store'

import { Button } from './button'

const CYCLE: ThemeMode[] = ['light', 'dark', 'system']
const ICONS = { light: Sun, dark: Moon, system: Monitor } as const

/** Cycle the persisted theme mode light → dark → system (plan §4.6). */
export const ThemeToggle = () => {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const Icon = ICONS[mode]

  const next = () => setMode(CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length] ?? 'system')

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={next}
      aria-label={`Theme: ${mode}`}
      title={`Theme: ${mode}`}
    >
      <Icon />
    </Button>
  )
}
