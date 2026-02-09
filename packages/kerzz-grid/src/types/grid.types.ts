import type { GridColumnDef } from './column.types';
import type { FilterState, DisabledFilterState } from './filter.types';
import type { GridTheme } from './theme.types';
import type { ToolbarConfig } from './toolbar.types';
import type { SelectionMode } from './selection.types';
import type { SortingState } from '@tanstack/react-table';

// Re-export for consumers
export type { SortingState };

export interface GridProps<TData = unknown> {
  /** Data array to display */
  data: TData[];
  /** Column definitions */
  columns: GridColumnDef<TData>[];
  /** Grid height — number (px) or CSS string like '100%' */
  height?: number | string;
  /** Grid width (default: '100%') */
  width?: string | number;
  /** Locale identifier */
  locale?: 'tr' | 'en';
  /** Theme override */
  theme?: GridTheme;
  /** Loading state */
  loading?: boolean;
  /** Unique key for state persistence */
  stateKey?: string;
  /** State storage type */
  stateStorage?: 'localStorage' | 'sessionStorage' | 'none';
  /** Row key accessor */
  getRowId?: (row: TData) => string;
  /** Row height in pixels (overrides theme) */
  rowHeight?: number;
  /** Header height in pixels (overrides theme) */
  headerHeight?: number;
  /** Number of rows to render outside visible area */
  overscan?: number;
  /** Enable alternating row colors */
  stripedRows?: boolean;
  /** Show grid borders */
  bordered?: boolean;
  /** Toolbar configuration. Pass true for defaults, false to hide, or config object for customization. Default: true */
  toolbar?: boolean | ToolbarConfig<TData>;

  // Selection
  /** Selection mode: 'none' | 'single' | 'multiple' (default: 'single') */
  selectionMode?: SelectionMode;
  /** Show selection checkbox column (default: true when selectionMode is not 'none') */
  selectionCheckbox?: boolean;
  /** Currently selected row IDs (controlled mode) */
  selectedIds?: string[];
  /** Default selected row IDs (uncontrolled mode) */
  defaultSelectedIds?: string[];
  /** Fired when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;

  // Editing
  /** External context data passed to cell editors and custom renderers */
  context?: Record<string, unknown>;
  /** Fired when a cell value changes via inline editing */
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;

  // Events
  /** Fired when a row is clicked */
  onRowClick?: (row: TData, index: number) => void;
  /** Fired when a row is double-clicked */
  onRowDoubleClick?: (row: TData, index: number) => void;
  /** Fired when sorting changes */
  onSortChange?: (sorting: SortingState) => void;
  /** Fired when filters change */
  onFilterChange?: (filters: FilterState) => void;
  /** Fired when column order changes */
  onColumnOrderChange?: (columnOrder: string[]) => void;
  /** Fired when column visibility changes */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;

  /** Factory function that creates an empty row object.
   *  When provided, the grid manages pending new rows internally:
   *  - Clicking "+" creates a pending row shown in the grid but not committed.
   *  - Clicking "Save" commits pending rows via onNewRowSave.
   *  - Clicking "Cancel" discards pending rows. */
  createEmptyRow?: () => TData;

  /** Fired when Save is clicked and there are pending new rows.
   *  Receives the array of pending new rows (with any cell edits applied). */
  onNewRowSave?: (rows: TData[]) => void;

  /** Fired when a cell value changes in a pending or modified row.
   *  Use this to update related/computed columns (e.g. qty change -> totalPrice recalc).
   *  Should return the updated row. If not provided, defaults to { ...row, [columnId]: newValue }. */
  onPendingCellChange?: (row: TData, columnId: string, newValue: unknown) => TData;

  /** Fired after all pending changes are committed (Save button clicked) */
  onEditSave?: () => void;
  /** Fired after all pending changes are discarded (Cancel button clicked) */
  onEditCancel?: () => void;
}

export interface GridState {
  columnWidths: Record<string, number>;
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  sorting: SortingState;
  filters: FilterState;
  disabledFilters: DisabledFilterState;
  version: number;
}

export interface GridRef {
  /** Reset all filters */
  resetFilters: () => void;
  /** Reset sorting */
  resetSorting: () => void;
  /** Reset state to default */
  resetState: () => void;
  /** Get current state */
  getState: () => GridState;
  /** Scroll to a specific row index */
  scrollToRow: (index: number) => void;
  /** Get selected row IDs */
  getSelectedIds: () => string[];
  /** Select all rows */
  selectAll: () => void;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Trigger add-row flow (requires createEmptyRow to be provided) */
  addRow: () => void;
}
