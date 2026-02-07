import type { GridColumnDef } from './column.types';

/** Built-in cell editor types */
export type CellEditorType = 'text' | 'number' | 'select' | 'boolean' | 'custom';

/** Option item for select-type editors */
export interface SelectEditorOption {
  id: string;
  name: string;
}

/** Configuration for a cell editor */
export interface CellEditorConfig<TData = unknown> {
  /** Built-in editor type */
  type: CellEditorType;
  /** Options for select editor */
  options?: SelectEditorOption[] | ((row: TData, context?: Record<string, unknown>) => SelectEditorOption[]);
  /** Custom editor component (used when type is 'custom') */
  customEditor?: React.ComponentType<CellEditorProps<TData>>;
}

/** Props passed to cell editor components */
export interface CellEditorProps<TData = unknown> {
  /** Current cell value */
  value: unknown;
  /** The full row data */
  row: TData;
  /** Column definition */
  column: GridColumnDef<TData>;
  /** Save the new value and close editor */
  onSave: (newValue: unknown) => void;
  /** Cancel editing and close editor */
  onCancel: () => void;
  /** External context data passed from Grid props */
  context?: Record<string, unknown>;
}

/** State for the currently editing cell */
export interface EditingState {
  /** Row index being edited */
  rowIndex: number;
  /** Column id being edited */
  columnId: string;
}
