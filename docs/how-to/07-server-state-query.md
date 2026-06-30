# 07 — Server State with TanStack Query

Goal: fetch, cache, and mutate server data with TanStack Query — the **only** place server data
lives. This is the other half of the state-separation law from guide 06.

## Query keys first

Every resource derives typed keys from a namespace with `createQueryKeys` (from `@/shared/api`).
Consistent keys are what make caching and invalidation predictable:

```ts
import { createQueryKeys } from '@/shared/api'

export const userKeys = createQueryKeys('users')
// userKeys.all          → ['users']
// userKeys.lists()      → ['users', 'list']
// userKeys.list(params) → ['users', 'list', params]
// userKeys.detail(id)   → ['users', 'detail', id]
```

Invalidating `userKeys.all` clears every derived key (prefix match); `userKeys.lists()` clears
only lists. The generated `<feature>-keys.ts` already gives you this.

## Read: `useQuery`

The list params are **part of the key**, so each filter/sort/page combination caches
independently. `placeholderData: keepPreviousData` keeps the current rows on screen while the next
page loads — no flicker. This is the seed's `use-users-query.ts`:

```ts
export const useUsersQuery = (params: UsersListParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => {
      const search = new URLSearchParams({
        q: params.q,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        page: String(params.page),
        pageSize: String(params.pageSize),
      })
      return http.get<UsersListResponse>(`/users?${search.toString()}`)
    },
    placeholderData: keepPreviousData,
  })
```

The `http` client (guide 15) injects the auth token, sends cookies, parses JSON, and throws
`ApiError` on non-2xx — so query functions stay this small.

## Write: `useMutation` + invalidate

A mutation changes server data, then **invalidates** the affected keys so any mounted query
refetches. The seed's `use-user-mutations.ts`:

```ts
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => http.post<User>('/users', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
```

Invalidating `userKeys.all` after a create/update/delete refreshes every users list regardless of
its filter/page. Call it from your component like any hook:

```tsx
const createUser = useCreateUser()
createUser.mutate(values, { onSuccess: () => onClose() })
```

## Sensible defaults are already set

`src/shared/api/query-client.ts` configures the client so individual hooks stay clean:

- `staleTime: 60s`, `gcTime: 5m` — fewer redundant refetches.
- **Smart retry:** never retry `4xx` (those are caller bugs, not transient); retry other failures
  up to twice. Mutations don't retry.
- `refetchOnWindowFocus: false`.
- A central `onError` sink logs in dev.

Tests get an **isolated** client via the `createQueryClient()` factory (guide 14).

## The law, restated

Server data → **Query**. UI state about that data (which row is selected, the current filter) →
**Zustand** (guide 06). The users grid is the canonical split: rows come from `useUsersQuery`;
the sort/filter/page/selection driving it live in `useUsersStore`.
(See [ADR-0001](../adr/0001-state-separation.md).)

> **Rules in play:** data fetching stays in Query — **not** React Router loaders. Loaders may
> only do auth/prefetch via `queryClient.ensureQueryData` (guide 12). ([`AGENTS.md`](../../AGENTS.md) §7.)

---

**Next →** [08 — Forms with React Hook Form + Zod](./08-forms-rhf-zod.md)
