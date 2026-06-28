import { createPersistedStore, type PersistedStoreInitializer } from './create-store'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const initializer: PersistedStoreInitializer<ThemeState> = (set) => ({
  mode: 'system',
  setMode: (mode) =>
    set(
      (state) => {
        state.mode = mode
      },
      false,
      'theme/setMode',
    ),
})

// Persisted: the chosen theme mode survives reloads. Applied to <html> by ThemeProvider.
// Only `mode` is persisted (the second type arg narrows the stored shape).
export const useThemeStore = createPersistedStore<ThemeState, Pick<ThemeState, 'mode'>>(
  'theme',
  initializer,
  { partialize: (state) => ({ mode: state.mode }) },
)
