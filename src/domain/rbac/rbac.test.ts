import { describe, expect, it } from 'vitest'

import { hasPermission, permissionsForRoles } from './rbac'

describe('rbac', () => {
  it('grants permissions according to the role matrix', () => {
    expect(hasPermission(['admin'], 'users:delete')).toBe(true)
    expect(hasPermission(['viewer'], 'users:delete')).toBe(false)
    expect(hasPermission(['viewer'], 'users:read')).toBe(true)
  })

  it('unions permissions across multiple roles', () => {
    const granted = permissionsForRoles(['viewer', 'manager'])
    expect(granted.has('users:read')).toBe(true)
    expect(granted.has('users:update')).toBe(true)
    expect(granted.has('users:delete')).toBe(false)
  })
})
