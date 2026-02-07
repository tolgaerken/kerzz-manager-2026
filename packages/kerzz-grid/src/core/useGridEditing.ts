import { useState, useCallback, useRef } from 'react';
import type { EditingState, PendingChange } from '../types/editing.types';
import type { GridColumnDef } from '../types/column.types';

export interface UseGridEditingProps<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;
}

export interface UseGridEditingReturn {
  /** Currently editing cell */
  editingCell: EditingState | null;
  /** Whether the grid is in batch edit mode */
  editMode: boolean;
  /** Whether there are unsaved pending changes */
  hasPendingChanges: boolean;
  /** Start editing a specific cell */
  startEditing: (rowIndex: number, columnId: string) => void;
  /** Stop editing the current cell (keeps edit mode active) */
  stopEditing: () => void;
  /** Save a cell value to pending changes and close the editor */
  saveValue: (newValue: unknown) => void;
  /** Check if a specific cell is being edited */
  isEditing: (rowIndex: number, columnId: string) => boolean;
  /** Check if a cell has a pending change */
  hasPendingChange: (rowIndex: number, columnId: string) => boolean;
  /** Get the pending value for a cell, or undefined if no pending change */
  getPendingValue: (rowIndex: number, columnId: string) => unknown | undefined;
  /** Commit all pending changes and exit edit mode */
  saveAllChanges: () => void;
  /** Discard all pending changes and exit edit mode */
  cancelAllChanges: () => void;
}

export function useGridEditing<TData>({
  columns,
  data,
  onCellValueChange,
}: UseGridEditingProps<TData>): UseGridEditingReturn {
  const [editingCell, setEditingCell] = useState<EditingState | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange<TData>>>(
    () => new Map(),
  );

  // Keep a mutable ref in sync so that saveAllChanges always reads the latest
  // pending changes even when called in the same event batch as saveValue.
  const pendingRef = useRef<Map<string, PendingChange<TData>>>(pendingChanges);

  const hasPendingChanges = pendingChanges.size > 0;

  const startEditing = useCallback(
    (rowIndex: number, columnId: string) => {
      const col = columns.find((c) => c.id === columnId);
      if (!col) return;

      const row = data[rowIndex];
      if (!row) return;

      const isEditable =
        typeof col.editable === 'function' ? col.editable(row) : col.editable === true;
      if (!isEditable) return;

      // Enter edit mode on first edit
      setEditMode(true);
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

      // Get old value from original data
      const oldValue = col.accessorFn
        ? col.accessorFn(row)
        : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

      // Store in pending changes (only if value actually changed)
      if (oldValue !== newValue) {
        const key = `${rowIndex}-${columnId}`;
        const next = new Map(pendingRef.current);
        next.set(key, { rowIndex, columnId, newValue, oldValue, row });
        pendingRef.current = next;
        setPendingChanges(next);
      }

      setEditingCell(null);
    },
    [editingCell, data, columns],
  );

  const saveAllChanges = useCallback(() => {
    // Read from ref to get the absolute latest (including batched updates)
    const current = pendingRef.current;
    if (onCellValueChange) {
      current.forEach((change) => {
        onCellValueChange(change.row, change.columnId, change.newValue, change.oldValue);
      });
    }

    const empty = new Map<string, PendingChange<TData>>();
    pendingRef.current = empty;
    setPendingChanges(empty);
    setEditingCell(null);
    setEditMode(false);
  }, [onCellValueChange]);

  const cancelAllChanges = useCallback(() => {
    const empty = new Map<string, PendingChange<TData>>();
    pendingRef.current = empty;
    setPendingChanges(empty);
    setEditingCell(null);
    setEditMode(false);
  }, []);

  const hasPendingChange = useCallback(
    (rowIndex: number, columnId: string): boolean => {
      const key = `${rowIndex}-${columnId}`;
      return pendingChanges.has(key);
    },
    [pendingChanges],
  );

  const getPendingValue = useCallback(
    (rowIndex: number, columnId: string): unknown | undefined => {
      const key = `${rowIndex}-${columnId}`;
      const change = pendingChanges.get(key);
      return change?.newValue;
    },
    [pendingChanges],
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
    editMode,
    hasPendingChanges,
    startEditing,
    stopEditing,
    saveValue,
    isEditing,
    hasPendingChange,
    getPendingValue,
    saveAllChanges,
    cancelAllChanges,
  };
}
