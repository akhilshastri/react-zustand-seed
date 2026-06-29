import { HttpResponse } from 'msw'

import { hasPermission, type Permission } from '@/domain/rbac'

import { verifyAccessToken } from './auth-tokens'
import { db, type DbUser } from './db'

const bearerToken = (request: Request): string | undefined =>
  request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

/** Resolve the authenticated user from the access token, or `null`. */
export const authenticate = (request: Request): DbUser | null => {
  const userId = verifyAccessToken(bearerToken(request))
  return userId ? (db.users.find((user) => user.id === userId) ?? null) : null
}

/**
 * Backend authorization guard. Returns the user, or an error `Response` (401 unauthenticated /
 * 403 forbidden) for the handler to return as-is. This — not the client `<Can>` — is the real
 * authority: client RBAC only hides UI; the API enforces it (plan §4.6).
 *
 * ```ts
 * const auth = requirePermission(request, 'users:create')
 * if (auth instanceof Response) return auth
 * // ...auth is the DbUser
 * ```
 */
export const requirePermission = (request: Request, permission: Permission): DbUser | Response => {
  const user = authenticate(request)
  if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user.roles, permission)) {
    return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
  }
  return user
}
