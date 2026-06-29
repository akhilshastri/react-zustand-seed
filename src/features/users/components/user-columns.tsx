import type { ColumnDef } from '@tanstack/react-table'

import type { User } from '@/domain/user'

/**
 * Column definitions for the users grid. Defined at module scope (stable identity) so the table
 * never resets; per-row actions are handled by the grid's `onRowClick` (edit) and row selection
 * (bulk delete) instead of closures baked into columns.
 */
export const userColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <input
        type="checkbox"
        className="size-4 cursor-pointer"
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }}
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="size-4 cursor-pointer"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${row.original.name}`}
      />
    ),
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    id: 'roles',
    header: 'Roles',
    enableSorting: false,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.roles.join(', ')}</span>,
  },
]
