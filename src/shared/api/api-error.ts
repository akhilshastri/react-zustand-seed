/**
 * Normalized transport error. Every non-2xx response from `http-client` is thrown as an
 * `ApiError` so callers (and the Query global error handler) branch on `status`/`code`
 * instead of inspecting raw `Response` objects. See plan §4.2 / §4.6.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | undefined
  /** Raw parsed response body, when present — useful for field-level validation errors. */
  readonly body: unknown

  constructor(status: number, message: string, options?: { code?: string; body?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = options?.code
    this.body = options?.body
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }
}
