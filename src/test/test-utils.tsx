import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { useState, type ReactElement, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router'

import { createQueryClient } from '@/shared/api'

/**
 * Wraps a component under test in the providers it needs: a fresh QueryClient (isolated cache
 * per render) and a MemoryRouter (so `Link`/`useNavigate` work). Global Zustand stores need no
 * provider. Use directly as `renderHook`'s `wrapper`.
 */
export const AllProviders = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => createQueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
