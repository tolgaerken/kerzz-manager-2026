import { useState, useCallback, useRef, useEffect } from 'react';
import type { EditingState, PendingChange, NavigationDirection } from '../types/editing.types';
import type { GridColumnDef } from '../types/column.types';

export interface UseGridEditingProps<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;
  onRowAdd?: () => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;
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
  /** Save value and navigate to the next editable cell */
  saveAndMoveNext: (newValue: unknown, direction: NavigationDirection) => void;
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
  /** Request adding a new row (emits onRowAdd and auto-edits the new row) */
  requestAddRow: () => void;
}

export function useGridEditing<TData>({
  columns,
  data,
  onCellValueChange,
  onRowAdd,
  onEditSave,
  onEditCancel,
}: UseGridEditingProps<TData>): UseGridEditingReturn {
  const [editingCell, setEditingCell] = useState<EditingState | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange<TData>>>(
    () => new Map(),
  );

  // Keep a mutable ref in sync so that saveAllChanges always reads the latest
  // pending changes even when called in the same event batch as saveValue.
  const pendingRef = useRef<Map<string, PendingChange<TData>>>(pendingChanges);

  // Flag to auto-start editing after a new row is added
  const pendingEditAfterAdd = useRef(false);
  // Track previous data length to detect new rows
  const prevDataLengthRef = useRef(data.length);

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

  /**
   * Find the next editable column index after the given column index in the columns array.
   * Returns -1 if none found.
   */
  const findNextEditableColumnIndex = useCallback(
    (startColIdx: number, rowIndex: number): number => {
      const row = data[rowIndex];
      if (!row) return -1;
      for (let i = startColIdx; i < columns.length; i++) {
        const col = columns[i];
        const isEditable =
          typeof col.editable === 'function' ? col.editable(row) : col.editable === true;
        if (isEditable && col.cellEditor) return i;
      }
      return -1;
    },
    [columns, data],
  );

  /**
   * Save the current cell value and navigate to the next editable cell.
   * Tab/Enter: move to next editable cell in the same row, then wrap to next row.
   */
  const saveAndMoveNext = useCallback(
    (newValue: unknown, _direction: NavigationDirection) => {
      if (!editingCell) return;

      const { rowIndex, columnId } = editingCell;
      const row = data[rowIndex];
      const col = columns.find((c) => c.id === columnId);
      if (!row || !col) {
        setEditingCell(null);
        return;
      }

      // Save the current value to pending changes
      const oldValue = col.accessorFn
        ? col.accessorFn(row)
        : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

      if (oldValue !== newValue) {
        const key = `${rowIndex}-${columnId}`;
        const next = new Map(pendingRef.current);
        next.set(key, { rowIndex, columnId, newValue, oldValue, row });
        pendingRef.current = next;
        setPendingChanges(next);
      }

      // Find the current column index
      const currentColIdx = columns.findIndex((c) => c.id === columnId);

      // Try next editable cell in the same row
      const nextColIdx = findNextEditableColumnIndex(currentColIdx + 1, rowIndex);
      if (nextColIdx !== -1) {
        setEditingCell({ rowIndex, columnId: columns[nextColIdx].id });
        return;
      }

      // Try first editable cell in the next row
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex < data.length) {
        const firstColIdx = findNextEditableColumnIndex(0, nextRowIndex);
        if (firstColIdx !== -1) {
          setEditingCell({ rowIndex: nextRowIndex, columnId: columns[firstColIdx].id });
          return;
        }
      }

      // No more editable cells, just close editor
      setEditingCell(null);
    },
    [editingCell, data, columns, findNextEditableColumnIndex],
  );

  /**
   * Request adding a new row. Emits onRowAdd so the parent adds the row,
   * then auto-starts editing the first editable cell of the new row.
   */
  const requestAddRow = useCallback(() => {
    if (!onRowAdd) return;
    setEditMode(true);
    pendingEditAfterAdd.current = true;
    onRowAdd();
  }, [onRowAdd]);

  // Watch for data length changes and auto-edit new row if requested
  useEffect(() => {
    if (pendingEditAfterAdd.current && data.length > prevDataLengthRef.current) {
      pendingEditAfterAdd.current = false;
      const newRowIndex = data.length - 1;
      const firstColIdx = findNextEditableColumnIndex(0, newRowIndex);
      if (firstColIdx !== -1) {
        setEditingCell({ rowIndex: newRowIndex, columnId: columns[firstColIdx].id });
      }
    }
    prevDataLengthRef.current = data.length;
  }, [data.length, columns, findNextEditableColumnIndex]);

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

    // Notify parent that save completed (e.g. for pending new rows)
    onEditSave?.();
  }, [onCellValueChange, onEditSave]);

  const cancelAllChanges = useCallback(() => {
    const empty = new Map<string, PendingChange<TData>>();
    pendingRef.current = empty;
    setPendingChanges(empty);
    setEditingCell(null);
    setEditMode(false);

    // Notify parent that cancel completed (e.g. to discard pending new rows)
    onEditCancel?.();
  }, [onEditCancel]);

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
    saveAndMoveNext,
    isEditing,
    hasPendingChange,
    getPendingValue,
    saveAllChanges,
    cancelAllChanges,
    requestAddRow,
  };
}
