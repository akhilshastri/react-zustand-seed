import { http, HttpResponse } from 'msw'

import { userInputSchema, type User } from '@/domain/user'

import { requirePermission } from '../auth-context'
import { db, type DbUser } from '../db'

const toUser = (user: DbUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
})

/**
 * Users REST resource (plan §4.5/§4.6). The list is server-driven (filter/sort/paginate via
 * query params); every operation is permission-enforced with `requirePermission`, so the API —
 * not the client `<Can>` — is the authority (403 on unauthorized writes).
 */
export default [
  http.get('/api/users', ({ request }) => {
    const auth = requirePermission(request, 'users:read')
    if (auth instanceof Response) return auth

    const url = new URL(request.url)
    const q = (url.searchParams.get('q') ?? '').toLowerCase()
    const sortBy = url.searchParams.get('sortBy') === 'email' ? 'email' : 'name'
    const sortDir = url.searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc'
    const page = Math.max(0, Number(url.searchParams.get('page') ?? '0'))
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? '25'))

    let result = db.users.map(toUser)
    if (q) {
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }
    result.sort((a, b) => {
      const compared = a[sortBy].localeCompare(b[sortBy])
      return sortDir === 'asc' ? compared : -compared
    })

    const total = result.length
    const rows = result.slice(page * pageSize, page * pageSize + pageSize)
    return HttpResponse.json({ rows, total })
  }),

  http.post('/api/users', async ({ request }) => {
    const auth = requirePermission(request, 'users:create')
    if (auth instanceof Response) return auth

    const parsed = userInputSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid user', code: 'validation' }, { status: 422 })
    }
    const { name, email, role } = parsed.data
    const user: DbUser = { id: `u_${Date.now()}`, name, email, password: 'password', roles: [role] }
    db.users.unshift(user)
    return HttpResponse.json(toUser(user), { status: 201 })
  }),

  http.patch('/api/users/:id', async ({ request, params }) => {
    const auth = requirePermission(request, 'users:update')
    if (auth instanceof Response) return auth

    const user = db.users.find((u) => u.id === params.id)
    if (!user) return HttpResponse.json({ message: 'User not found' }, { status: 404 })

    const parsed = userInputSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid user', code: 'validation' }, { status: 422 })
    }
    user.name = parsed.data.name
    user.email = parsed.data.email
    user.roles = [parsed.data.role]
    return HttpResponse.json(toUser(user))
  }),

  http.delete('/api/users/:id', ({ request, params }) => {
    const auth = requirePermission(request, 'users:delete')
    if (auth instanceof Response) return auth

    const index = db.users.findIndex((u) => u.id === params.id)
    if (index === -1) return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    db.users.splice(index, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
