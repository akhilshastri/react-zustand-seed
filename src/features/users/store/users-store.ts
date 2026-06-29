import {
  functionalUpdate,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'

import { createStore, type StoreInitializer } from '@/shared/store'

const DEFAULT_PAGE_SIZE = 25

/**
 * Client-only UI state for the users grid (plan §3): filter text, sort, page, and selection.
 * This is view state, NOT server data — the rows themselves live in the TanStack Query cache.
 * The setters are typed as `OnChangeFn` so they plug straight into `<DataGrid>` and resolve
 * TanStack's updater form against current state.
 */
interface UsersUiState {
  globalFilter: string
  sorting: SortingState
  pagination: PaginationState
  rowSelection: RowSelectionState
  setGlobalFilter: (value: string) => void
  setSorting: OnChangeFn<SortingState>
  setPagination: OnChangeFn<PaginationState>
  setRowSelection: OnChangeFn<RowSelectionState>
}

const initializer: StoreInitializer<UsersUiState> = (set, get) => ({
  globalFilter: '',
  sorting: [{ id: 'name', desc: false }],
  pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
  rowSelection: {},
  // Filtering or re-sorting resets to the first page (the old page may not exist anymore).
  setGlobalFilter: (value) =>
    set(
      (s) => {
        s.globalFilter = value
        s.pagination.pageIndex = 0
      },
      false,
      'users/setGlobalFilter',
    ),
  setSorting: (updater) =>
    set(
      (s) => {
        s.sorting = functionalUpdate(updater, get().sorting)
        s.pagination.pageIndex = 0
      },
      false,
      'users/setSorting',
    ),
  setPagination: (updater) =>
    set(
      (s) => {
        s.pagination = functionalUpdate(updater, get().pagination)
      },
      false,
      'users/setPagination',
    ),
  setRowSelection: (updater) =>
    set(
      (s) => {
        s.rowSelection = functionalUpdate(updater, get().rowSelection)
      },
      false,
      'users/setRowSelection',
    ),
})

export const useUsersStore = createStore<UsersUiState>('users-ui', initializer)
