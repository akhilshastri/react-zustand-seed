/**
 * Query-key factory. Each feature derives typed keys from a namespace so caching and
 * invalidation stay consistent across the app (plan §4.2):
 *
 * ```ts
 * const userKeys = createQueryKeys('users')
 * userKeys.all              // ['users']
 * userKeys.list({ q: 'a' }) // ['users', 'list', { q: 'a' }]
 * userKeys.detail(42)       // ['users', 'detail', 42]
 * ```
 *
 * Invalidating `userKeys.all` clears every derived key (prefix match), `userKeys.lists()`
 * clears only lists, and so on.
 */
export const createQueryKeys = <const Namespace extends string>(namespace: Namespace) => ({
  all: [namespace] as const,
  lists: () => [namespace, 'list'] as const,
  list: (filters: unknown) => [namespace, 'list', filters] as const,
  details: () => [namespace, 'detail'] as const,
  detail: (id: string | number) => [namespace, 'detail', id] as const,
})
