import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { User } from '@/domain/user'
import { Can, usePermissions } from '@/features/auth'
import { Button } from '@/shared/ui/button'
import { DataGrid } from '@/shared/ui/data-grid'

import { useDeleteUser } from '../api/use-user-mutations'
import { useUsersQuery } from '../api/use-users-query'
import { useUsersStore } from '../store/users-store'
import { userColumns } from './user-columns'
import { UserFormDialog } from './user-form-dialog'

/**
 * Users feature page (plan §4.5): a server-driven DataGrid (sort/filter/paginate against MSW)
 * with role-gated create / edit (row click) / bulk delete. Mutations invalidate the list so the
 * grid refetches; the API independently enforces permissions with 403s.
 */
export const UsersPage = () => {
  const { has } = usePermissions()

  const { globalFilter, sorting, pagination, rowSelection } = useUsersStore(
    useShallow((s) => ({
      globalFilter: s.globalFilter,
      sorting: s.sorting,
      pagination: s.pagination,
      rowSelection: s.rowSelection,
    })),
  )
  const setGlobalFilter = useUsersStore((s) => s.setGlobalFilter)
  const setSorting = useUsersStore((s) => s.setSorting)
  const setPagination = useUsersStore((s) => s.setPagination)
  const setRowSelection = useUsersStore((s) => s.setRowSelection)

  const sortBy = sorting[0]?.id === 'email' ? 'email' : 'name'
  const sortDir = sorting[0]?.desc ? 'desc' : 'asc'
  const usersQuery = useUsersQuery({
    q: globalFilter,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  })

  const canDelete = has('users:delete')
  const canUpdate = has('users:update')
  const columns = useMemo(
    () => (canDelete ? userColumns : userColumns.filter((column) => column.id !== 'select')),
    [canDelete],
  )

  const [dialogUser, setDialogUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const deleteUser = useDeleteUser()

  const selectedIds = Object.keys(rowSelection)
  const openCreate = () => {
    setDialogUser(null)
    setDialogOpen(true)
  }
  const openEdit = (user: User) => {
    setDialogUser(user)
    setDialogOpen(true)
  }
  const deleteSelected = () => {
    selectedIds.forEach((id) => deleteUser.mutate(id))
    setRowSelection({})
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            Server-driven grid backed by MSW — sort, filter, and paginate hit the mock API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && selectedIds.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              disabled={deleteUser.isPending}
            >
              Delete {selectedIds.length}
            </Button>
          ) : null}
          <Can permission="users:create">
            <Button size="sm" onClick={openCreate}>
              New user
            </Button>
          </Can>
        </div>
      </div>

      <DataGrid
        data={usersQuery.data?.rows ?? []}
        columns={columns}
        sorting={sorting}
        onSortingChange={setSorting}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowCount={usersQuery.data?.total ?? 0}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableRowSelection={canDelete}
        getRowId={(user) => user.id}
        onRowClick={canUpdate ? openEdit : undefined}
        isLoading={usersQuery.isPending}
        searchPlaceholder="Search name or email…"
      />

      <UserFormDialog open={dialogOpen} user={dialogUser} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
