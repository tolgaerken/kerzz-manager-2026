import type { ColumnFilterConfig } from './filter.types';
import type { FooterConfig } from './footer.types';

export interface GridColumnDef<TData = unknown> {
  /** Unique column identifier */
  id: string;
  /** Header display text */
  header: string;
  /** Key to access data from row object */
  accessorKey?: keyof TData & string;
  /** Custom accessor function */
  accessorFn?: (row: TData) => unknown;
  /** Custom cell renderer */
  cell?: (value: unknown, row: TData) => React.ReactNode;
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
}
