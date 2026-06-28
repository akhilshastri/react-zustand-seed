import { createStore, type StoreInitializer } from './create-store'

export interface UiState {
  sidebarOpen: boolean
  isOffline: boolean
  updateAvailable: boolean
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
  setOffline: (offline: boolean) => void
  showUpdateToast: () => void
  /** Reset transient UI to defaults — called from app/bindings.ts on logout (plan §4.9). */
  reset: () => void
}

const defaults = {
  sidebarOpen: true,
  isOffline: false,
  updateAvailable: false,
}

const initializer: StoreInitializer<UiState> = (set) => ({
  ...defaults,
  toggleSidebar: () =>
    set(
      (s) => {
        s.sidebarOpen = !s.sidebarOpen
      },
      false,
      'ui/toggleSidebar',
    ),
  setSidebar: (open) =>
    set(
      (s) => {
        s.sidebarOpen = open
      },
      false,
      'ui/setSidebar',
    ),
  setOffline: (offline) =>
    set(
      (s) => {
        s.isOffline = offline
      },
      false,
      'ui/setOffline',
    ),
  showUpdateToast: () =>
    set(
      (s) => {
        s.updateAvailable = true
      },
      false,
      'ui/showUpdateToast',
    ),
  reset: () =>
    set(
      (s) => {
        Object.assign(s, defaults)
      },
      false,
      'ui/reset',
    ),
})

export const useUiStore = createStore<UiState>('ui', initializer)
