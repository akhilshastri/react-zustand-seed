import { http, HttpResponse } from 'msw'

import type { User } from '@/domain/user'

import { authenticate } from '../auth-context'
import { mintAccessToken, mintRefreshToken, verifyRefreshToken } from '../auth-tokens'
import { db, type DbUser } from '../db'

const REFRESH_COOKIE = 'refreshToken'

// httpOnly so JS can never read it (no document.cookie); SameSite=Strict; the browser/MSW sends
// it automatically on /auth/refresh. This is the secure refresh-token shape a seed should teach
// (plan §4.6). MSW's cookie store round-trips it even though it is invisible to client JS.
const setRefreshCookie = (value: string, maxAgeSeconds?: number): string => {
  const parts = [`${REFRESH_COOKIE}=${value}`, 'HttpOnly', 'SameSite=Strict', 'Path=/']
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${maxAgeSeconds}`)
  return parts.join('; ')
}

const toUser = (user: DbUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
})

export default [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email?: string; password?: string }
    const user = db.users.find((u) => u.email === email && u.password === password)
    if (!user) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }
    return HttpResponse.json(
      { accessToken: mintAccessToken(user.id), user: toUser(user) },
      { headers: { 'Set-Cookie': setRefreshCookie(mintRefreshToken(user.id)) } },
    )
  }),

  http.post('/api/auth/refresh', ({ cookies }) => {
    const userId = verifyRefreshToken(cookies[REFRESH_COOKIE])
    const user = userId ? db.users.find((u) => u.id === userId) : undefined
    if (!user) return HttpResponse.json({ message: 'Session expired' }, { status: 401 })
    return HttpResponse.json({ accessToken: mintAccessToken(user.id), user: toUser(user) })
  }),

  http.post(
    '/api/auth/logout',
    () =>
      new HttpResponse(null, {
        status: 204,
        headers: { 'Set-Cookie': setRefreshCookie('', 0) },
      }),
  ),

  http.get('/api/auth/me', ({ request }) => {
    const user = authenticate(request)
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    return HttpResponse.json(toUser(user))
  }),
]
