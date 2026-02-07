/**
 * Selection mode for the grid
 * - 'none': No selection allowed
 * - 'single': Only one row can be selected at a time
 * - 'multiple': Multiple rows can be selected (with shift for range)
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Internal selection state
 */
export interface SelectionState {
  /** Set of selected row IDs */
  selectedIds: Set<string>;
  /** Last selected row ID (for shift+click range selection) */
  lastSelectedId: string | null;
}

/**
 * Selection configuration for GridProps
 */
export interface SelectionConfig {
  /** Selection mode */
  mode?: SelectionMode;
  /** Show checkbox column */
  showCheckbox?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Props for useRowSelection hook
 */
export interface UseRowSelectionProps<TData> {
  /** Data array */
  data: TData[];
  /** Function to get unique row ID */
  getRowId: (row: TData) => string;
  /** Selection mode */
  mode: SelectionMode;
  /** Controlled selected IDs */
  selectedIds?: string[];
  /** Default selected IDs (uncontrolled) */
  defaultSelectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Return type for useRowSelection hook
 */
export interface UseRowSelectionReturn {
  /** Set of selected row IDs */
  selectedIds: Set<string>;
  /** Check if a row is selected */
  isSelected: (rowId: string) => boolean;
  /** Toggle row selection (with optional shift key for range) */
  toggleRow: (rowId: string, shiftKey?: boolean) => void;
  /** Select all rows */
  selectAll: () => void;
  /** Deselect all rows */
  deselectAll: () => void;
  /** Whether all rows are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) rows are selected */
  isIndeterminate: boolean;
  /** Number of selected rows */
  selectedCount: number;
}
