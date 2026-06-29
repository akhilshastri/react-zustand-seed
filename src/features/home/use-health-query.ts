import { useQuery } from '@tanstack/react-query'

import { createQueryKeys, http } from '@/shared/api'

interface Health {
  status: string
  uptimeMs: number
  time: string
}

const healthKeys = createQueryKeys('health')

/** Sample server-state hook — resolves against the MSW `/api/health` handler (plan §4.2). */
export const useHealthQuery = () =>
  useQuery({
    queryKey: healthKeys.all,
    queryFn: () => http.get<Health>('/health'),
  })
