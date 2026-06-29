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

const FIRST_NAMES = [
  'Ada',
  'Grace',
  'Alan',
  'Linus',
  'Margaret',
  'Dennis',
  'Barbara',
  'Ken',
  'Radia',
  'Tim',
  'Katherine',
  'Donald',
  'Hedy',
  'Guido',
  'Joan',
  'Edsger',
]
const LAST_NAMES = [
  'Lovelace',
  'Hopper',
  'Turing',
  'Torvalds',
  'Hamilton',
  'Ritchie',
  'Liskov',
  'Thompson',
  'Perlman',
  'Berners-Lee',
  'Johnson',
  'Knuth',
  'Lamarr',
  'van Rossum',
  'Clarke',
  'Dijkstra',
]
const ALL_ROLES: Role[] = ['admin', 'manager', 'viewer']

// The three named accounts back the auth flow (stable ids/emails); the rest fill the grid so
// virtualization and server-driven paging have something to chew on.
const namedAccounts = (): DbUser[] => [
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

const generatedUsers = (count: number): DbUser[] =>
  Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length] as string
    const last = LAST_NAMES[(i * 5) % LAST_NAMES.length] as string
    const role = ALL_ROLES[i % ALL_ROLES.length] as Role
    return {
      id: `u_${i + 1}`,
      name: `${first} ${last}`,
      email: `${first}.${last}.${i + 1}@example.com`.toLowerCase().replace(/\s+/g, ''),
      password: 'password',
      roles: [role],
    }
  })

const seedUsers = (): DbUser[] => [...namedAccounts(), ...generatedUsers(200)]

export const db = {
  startedAt: Date.now(),
  users: seedUsers(),
}

export const resetDb = (): void => {
  db.users = seedUsers()
}
