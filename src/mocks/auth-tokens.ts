/**
 * Mock tokens — NOT real JWTs or crypto. They only round-trip a user id (+ expiry for access
 * tokens) so the MSW backend can demonstrate the access/refresh flow; a real backend mints and
 * verifies signed JWTs. Kept inside `mocks/` because this is backend-side logic (plan §4.6).
 */
const ACCESS_TTL_MS = 10 * 60_000

interface TokenPayload {
  sub: string
  typ: 'access' | 'refresh'
  exp?: number
}

const encode = (payload: TokenPayload): string => btoa(JSON.stringify(payload))

const decode = (token: string | undefined): TokenPayload | null => {
  if (!token) return null
  try {
    return JSON.parse(atob(token)) as TokenPayload
  } catch {
    return null
  }
}

export const mintAccessToken = (userId: string): string =>
  encode({ sub: userId, typ: 'access', exp: Date.now() + ACCESS_TTL_MS })

export const mintRefreshToken = (userId: string): string => encode({ sub: userId, typ: 'refresh' })

export const verifyAccessToken = (token: string | undefined): string | null => {
  const payload = decode(token)
  if (!payload || payload.typ !== 'access' || (payload.exp ?? 0) < Date.now()) return null
  return payload.sub
}

export const verifyRefreshToken = (token: string | undefined): string | null => {
  const payload = decode(token)
  if (!payload || payload.typ !== 'refresh') return null
  return payload.sub
}
