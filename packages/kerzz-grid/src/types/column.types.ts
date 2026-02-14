import type { ColumnFilterConfig } from './filter.types';
import type { FooterConfig } from './footer.types';
import type { CellEditorConfig } from './editing.types';

export interface GridColumnDef<TData = unknown> {
  /** Unique column identifier */
  id: string;
  /** Header display text */
  header: string;
  /** Key to access data from row object */
  accessorKey?: keyof TData & string;
  /** Custom accessor function */
  accessorFn?: (row: TData) => unknown;
  /**
   * Custom accessor function for filtering.
   * Use this when the filter value differs from the display value
   * (e.g., computed/lookup columns where cell renderer shows a different value).
   * If not provided, falls back to accessorFn or accessorKey.
   */
  filterAccessorFn?: (row: TData) => unknown;
  /**
   * Custom accessor function for sorting.
   * Use this when the sort value differs from the display value
   * (e.g., computed/lookup columns where cell renderer shows a different value).
   * If not provided, falls back to accessorFn or accessorKey.
   */
  sortAccessorFn?: (row: TData) => unknown;
  /**
   * Custom function to get display value for filter dropdown items.
   * Use this when the filter dropdown should show a different value than the raw data.
   * (e.g., showing app name instead of app ID in dropdown filter)
   * The function receives the raw value and should return the display string.
   */
  filterDisplayFn?: (value: unknown) => string;
  /** Custom cell renderer */
  cell?: (value: unknown, row: TData, context?: Record<string, unknown>) => React.ReactNode;
  /** Column width in pixels */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Whether the column is resizable */
  resizable?: boolean;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column can be dragged to reorder */
  draggable?: boolean;
  /** Whether the column can be hidden */
  hideable?: boolean;
  /** Whether the column is visible by default */
  visible?: boolean;
  /** Filter configuration */
  filter?: ColumnFilterConfig;
  /** Footer aggregation configuration */
  footer?: FooterConfig;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether the column is pinned */
  pinned?: 'left' | 'right' | false;
  /** Custom header renderer */
  headerCell?: (column: GridColumnDef<TData>) => React.ReactNode;
  /** Custom CSS class for cells */
  cellClassName?: string | ((value: unknown, row: TData) => string);
  /** Custom CSS class for header */
  headerClassName?: string;

  // ── Editing ──

  /** Whether this column's cells are editable. Default: false */
  editable?: boolean | ((row: TData) => boolean);
  /** Cell editor configuration */
  cellEditor?: CellEditorConfig<TData>;
  /** Format the raw value for display (used instead of cell when no custom renderer needed) */
  valueFormatter?: (value: unknown, row: TData) => string;
  /** Whether to render cell content as HTML (use with caution) */
  enableHtml?: boolean;
}
