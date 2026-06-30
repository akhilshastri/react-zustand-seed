# 09 — The DataGrid

Goal: render a large, **server-driven** table with the reusable `DataGrid` — sortable, filterable,
paginated, virtualized — and drive its state from a feature's Zustand store. The `DataGrid`
(`src/shared/ui/data-grid`) is TanStack Table v8 + Virtual v3, headless and controlled.

## How it's wired: three layers

1. **Server data** — rows + total come from a TanStack Query hook (guide 07).
2. **View state** — sort / filter / page / selection live in the feature's Zustand store (guide 06).
3. **The grid** — a controlled component; you pass state down and change-handlers back up.

The grid is **manual** by default (`manualSorting`, `manualFiltering`, `manualPagination`), meaning
it does **not** sort/filter/paginate in the browser — it reports intent, and you turn that into a
query. That's what makes it scale to large datasets.

## Define columns at module scope

Column defs are `ColumnDef<T>[]` defined **outside** the component (stable identity, so the table
never resets). From the seed's `user-columns.tsx`:

```tsx
export const userColumns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'roles',
    header: 'Roles',
    enableSorting: false,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.roles.join(', ')}</span>,
  },
]
```

Use `accessorKey` for plain values and a `cell` renderer for custom output. Set
`enableSorting: false` on columns the server can't sort by.

## Connect store → query → grid

The feature page reads view state from the store, maps it to query params, and feeds both the
query result and the store setters into the grid. This is the shape of `users-page.tsx`:

```tsx
const { globalFilter, sorting, pagination, rowSelection } = useUsersStore(useShallow((s) => ({ ... })))

const usersQuery = useUsersQuery({
  q: globalFilter,
  sortBy: sorting[0]?.id === 'email' ? 'email' : 'name',
  sortDir: sorting[0]?.desc ? 'desc' : 'asc',
  page: pagination.pageIndex,
  pageSize: pagination.pageSize,
})

<DataGrid
  data={usersQuery.data?.rows ?? []}
  columns={columns}
  sorting={sorting}            onSortingChange={setSorting}
  pagination={pagination}      onPaginationChange={setPagination}
  rowCount={usersQuery.data?.total ?? 0}
  globalFilter={globalFilter}  onGlobalFilterChange={setGlobalFilter}
  rowSelection={rowSelection}  onRowSelectionChange={setRowSelection}
  getRowId={(user) => user.id}
  onRowClick={openEdit}
  isLoading={usersQuery.isPending}
/>
```

The store's setters are typed as TanStack's `OnChangeFn`, so they plug straight in and resolve the
table's updater form against current state (see `users-store.ts`). `rowCount` (the server total)
is what makes pagination correct without holding every row in memory.

## Selection and row actions

- **Row selection:** pass `enableRowSelection`, `rowSelection`, `onRowSelectionChange`, and a
  `getRowId`. The selected ids drive bulk actions (the users page deletes the selected set).
- **Edit on click:** `onRowClick={(row) => openEdit(row)}` opens the edit dialog (guide 08).
- **Gate actions by permission:** wrap action buttons in `<Can>` and compute editable/deletable
  from `usePermissions()` (guide 10) — the users page hides the select column unless you can
  delete.

## One compiler caveat

React Compiler can't analyze TanStack Table's `useReactTable`, so the `DataGrid` component safely
**bails** out of compilation (Table memoizes itself internally). That single, documented
`// eslint-disable-next-line react-hooks/incompatible-library` lives inside `data-grid.tsx`; the
rest of the app stays compiler-optimized. You won't touch this unless you build another
table-like primitive. (See [ADR-0003](../adr/0003-react-compiler.md).)

> **Rules in play:** the grid is server-driven — sorting/filtering/paging are query inputs, not
> client-side array ops. Keep rows in Query and view state in the store. ([`AGENTS.md`](../../AGENTS.md) §1.)

---

**Next →** [10 — Auth & RBAC](./10-auth-and-rbac.md)
