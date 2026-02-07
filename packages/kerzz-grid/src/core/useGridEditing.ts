import { useState, useCallback } from 'react';
import type { EditingState } from '../types/editing.types';
import type { GridColumnDef } from '../types/column.types';

export interface UseGridEditingProps<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;
}

export interface UseGridEditingReturn {
  /** Currently editing cell */
  editingCell: EditingState | null;
  /** Start editing a specific cell */
  startEditing: (rowIndex: number, columnId: string) => void;
  /** Stop editing (save or cancel) */
  stopEditing: () => void;
  /** Save a value and stop editing */
  saveValue: (newValue: unknown) => void;
  /** Check if a specific cell is being edited */
  isEditing: (rowIndex: number, columnId: string) => boolean;
}

export function useGridEditing<TData>({
  columns,
  data,
  onCellValueChange,
}: UseGridEditingProps<TData>): UseGridEditingReturn {
  const [editingCell, setEditingCell] = useState<EditingState | null>(null);

  const startEditing = useCallback(
    (rowIndex: number, columnId: string) => {
      const col = columns.find((c) => c.id === columnId);
      if (!col) return;

      // Check editable
      const row = data[rowIndex];
      if (!row) return;

      const isEditable =
        typeof col.editable === 'function' ? col.editable(row) : col.editable === true;
      if (!isEditable) return;

      setEditingCell({ rowIndex, columnId });
    },
    [columns, data],
  );

  const stopEditing = useCallback(() => {
    setEditingCell(null);
  }, []);

  const saveValue = useCallback(
    (newValue: unknown) => {
      if (!editingCell) return;

      const { rowIndex, columnId } = editingCell;
      const row = data[rowIndex];
      const col = columns.find((c) => c.id === columnId);
      if (!row || !col) {
        setEditingCell(null);
        return;
      }

      // Get old value
      const oldValue = col.accessorFn
        ? col.accessorFn(row)
        : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

      // Only fire callback if value actually changed
      if (oldValue !== newValue && onCellValueChange) {
        onCellValueChange(row, columnId, newValue, oldValue);
      }

      setEditingCell(null);
    },
    [editingCell, data, columns, onCellValueChange],
  );

  const isEditing = useCallback(
    (rowIndex: number, columnId: string) => {
      return (
        editingCell !== null &&
        editingCell.rowIndex === rowIndex &&
        editingCell.columnId === columnId
      );
    },
    [editingCell],
  );

  return {
    editingCell,
    startEditing,
    stopEditing,
    saveValue,
    isEditing,
  };
}
