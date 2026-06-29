import { env } from '@/shared/config/env'

import { ApiError } from './api-error'
import { getAccessToken } from './auth-token'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON-serializable body; `Content-Type: application/json` is set automatically. */
  body?: unknown
  /** Override the base URL (defaults to `env.VITE_API_BASE_URL`). */
  baseUrl?: string
}

const buildUrl = (path: string, baseUrl: string): string => {
  if (path.startsWith('http')) return path
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

const parseBody = async (res: Response): Promise<unknown> => {
  const contentType = res.headers.get('content-type') ?? ''
  if (res.status === 204 || !contentType.includes('application/json')) return undefined
  return res.json()
}

/**
 * Typed `fetch` wrapper. Injects the in-memory access token, sends cookies (so MSW receives
 * the httpOnly refresh cookie), parses JSON, and throws `ApiError` on any non-2xx response.
 *
 * NOTE: single-flight 401 → refresh → retry is wired in Phase 2 with the auth feature
 * (plan §4.6). Phase 1 simply surfaces the 401 as an `ApiError`.
 */
export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, baseUrl = env.VITE_API_BASE_URL, headers, ...init } = options
  const token = getAccessToken()

  const res = await fetch(buildUrl(path, baseUrl), {
    ...init,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await parseBody(res)

  if (!res.ok) {
    const errBody = data as { message?: string; code?: string } | undefined
    throw new ApiError(res.status, errBody?.message ?? res.statusText, {
      code: errBody?.code,
      body: data,
    })
  }

  return data as T
}

/** Convenience verbs over `request`. */
export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
