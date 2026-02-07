import type { GridColumnDef } from './column.types';
import type { FilterState } from './filter.types';
import type { GridTheme } from './theme.types';
import type { ToolbarConfig } from './toolbar.types';
import type { SortingState } from '@tanstack/react-table';

export interface GridProps<TData = unknown> {
  /** Data array to display */
  data: TData[];
  /** Column definitions */
  columns: GridColumnDef<TData>[];
  /** Grid height in pixels */
  height?: number;
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
  /** Toolbar configuration. Pass true for defaults, or config object for customization */
  toolbar?: boolean | ToolbarConfig<TData>;

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
}

export interface GridState {
  columnWidths: Record<string, number>;
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  sorting: SortingState;
  filters: FilterState;
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
}
