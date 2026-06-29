import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { useRef } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface DataGridProps<TData> {
  data: TData[]
  // TanStack's column type mixes per-column value types; `any` here is its documented shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  /** Total rows on the server, for manual (server-driven) pagination. */
  rowCount?: number
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  enableRowSelection?: boolean
  getRowId?: (row: TData) => string
  isLoading?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  /** Scroll-container height — virtualization needs a bounded height. */
  height?: number
  estimateRowHeight?: number
}

/**
 * Reusable headless data grid (plan §4.5) — TanStack Table v8 + Virtual v3. Server-driven by
 * default (`manual*` flags): sorting, global filter, pagination, and selection are controlled
 * props the owning feature maps to a query key → MSW. Sticky header, sortable columns, optional
 * row selection, and virtualized rows for large result sets.
 */
export const DataGrid = <TData,>({
  data,
  columns,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  rowCount,
  globalFilter,
  onGlobalFilterChange,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  getRowId,
  isLoading = false,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results.',
  height = 480,
  estimateRowHeight = 44,
}: DataGridProps<TData>) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // React Compiler can't analyze TanStack Table's useReactTable, so it safely bails on this
  // component (Table does its own memoization internally) — the rest of the app stays optimized.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, rowSelection, globalFilter },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange,
    enableRowSelection,
    getRowId,
    rowCount,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length
  const gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
  })

  const pageIndex = table.getState().pagination?.pageIndex ?? 0
  const pageCount = table.getPageCount()
  const selectedCount = Object.keys(rowSelection ?? {}).length

  return (
    <div className="space-y-3">
      {onGlobalFilterChange ? (
        <Input
          value={globalFilter ?? ''}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
      ) : null}

      <div className="rounded-md border">
        <div ref={scrollRef} className="overflow-auto" style={{ height }}>
          <div role="table" className="min-w-full text-sm">
            <div role="rowgroup" className="bg-background sticky top-0 z-10 border-b">
              {table.getHeaderGroups().map((group) => (
                <div
                  role="row"
                  key={group.id}
                  className="grid items-center"
                  style={{ gridTemplateColumns }}
                >
                  {group.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()
                    return (
                      <div
                        role="columnheader"
                        key={header.id}
                        aria-sort={
                          sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                        }
                        className="text-muted-foreground px-3 py-2 text-left font-medium"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="hover:text-foreground inline-flex items-center gap-1"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-3.5" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-3.5" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="text-muted-foreground p-6 text-center">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="text-muted-foreground p-6 text-center">{emptyMessage}</div>
            ) : (
              <div
                role="rowgroup"
                style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  if (!row) return null
                  return (
                    <div
                      role="row"
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className={cn(
                        'hover:bg-muted/50 grid items-center border-b',
                        row.getIsSelected() && 'bg-muted/50',
                      )}
                      style={{
                        gridTemplateColumns,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <div role="cell" key={cell.id} className="truncate px-3 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            {enableRowSelection ? `${selectedCount} selected · ` : ''}
            {rowCount ?? rows.length} total
          </span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Page {pageIndex + 1} of {Math.max(pageCount, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
