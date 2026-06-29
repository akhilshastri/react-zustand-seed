import type { Role } from '@/domain/rbac'

/**
 * In-memory "database" for the MSW backend (plan §3 — MSW *is* the backend).
 *
 * `resetDb()` reseeds deterministically (used between tests). Passwords live here only because
 * this is a mock backend; a real one stores password hashes, never plaintext.
 */
export interface DbUser {
  id: string
  name: string
  email: string
  password: string
  roles: Role[]
}

const seedUsers = (): DbUser[] => [
  {
    id: 'u_admin',
    name: 'Ada Admin',
    email: 'admin@example.com',
    password: 'password',
    roles: ['admin'],
  },
  {
    id: 'u_manager',
    name: 'Max Manager',
    email: 'manager@example.com',
    password: 'password',
    roles: ['manager'],
  },
  {
    id: 'u_viewer',
    name: 'Vera Viewer',
    email: 'viewer@example.com',
    password: 'password',
    roles: ['viewer'],
  },
]

export const db = {
  startedAt: Date.now(),
  users: seedUsers(),
}

export const resetDb = (): void => {
  db.users = seedUsers()
}
