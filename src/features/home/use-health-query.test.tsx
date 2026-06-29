import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AllProviders } from '@/test/test-utils'

import { useHealthQuery } from './use-health-query'

describe('useHealthQuery', () => {
  it('resolves the backend health against the MSW server', async () => {
    const { result } = renderHook(() => useHealthQuery(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('ok')
  })
})
