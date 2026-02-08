import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import type { EditingState, NavigationDirection } from '../types/editing.types';
import type { GridColumnDef } from '../types/column.types';
import { useCellNavigation } from './useCellNavigation';

export interface UseGridEditingProps<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;
  onEditSave?: () => void;

  // Deferred new row props
  createEmptyRow?: () => TData;
  onNewRowSave?: (rows: TData[]) => void;
  onPendingCellChange?: (row: TData, columnId: string, newValue: unknown) => TData;
  pendingNewRows: TData[];
  setPendingNewRows: React.Dispatch<React.SetStateAction<TData[]>>;
  pendingRowIdSet: Set<string>;
  getRowId?: (row: TData) => string;
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
  /** Request adding a new row (requires createEmptyRow) */
  requestAddRow: () => void;
}

export function useGridEditing<TData>({
  columns,
  data,
  onCellValueChange,
  onEditSave,
  createEmptyRow,
  onNewRowSave,
  onPendingCellChange,
  pendingNewRows,
  setPendingNewRows,
  pendingRowIdSet,
  getRowId,
}: UseGridEditingProps<TData>): UseGridEditingReturn {
  const [editingCell, setEditingCell] = useState<EditingState | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Modified existing rows: rowIndex -> full modified row object
  const [modifiedRows, setModifiedRows] = useState<Map<number, TData>>(() => new Map());

  // Ref for modifiedRows so saveAllChanges always reads the latest
  const modifiedRowsRef = useRef<Map<number, TData>>(modifiedRows);
  useEffect(() => {
    modifiedRowsRef.current = modifiedRows;
  }, [modifiedRows]);

  // Ref for onCellValueChange so flushSync always calls the latest callback
  const onCellValueChangeRef = useRef(onCellValueChange);
  onCellValueChangeRef.current = onCellValueChange;

  // Flag to auto-start editing after a new row is added
  const pendingEditAfterAdd = useRef(false);
  // Track previous data length to detect new rows
  const prevDataLengthRef = useRef(data.length);

  // Keep a ref to pendingNewRows for saveAllChanges to read latest
  const pendingNewRowsRef = useRef<TData[]>(pendingNewRows);
  pendingNewRowsRef.current = pendingNewRows;

  const { findNextEditableColumnIndex, findNextEditableCell } = useCellNavigation(columns, data);

  const hasPendingChanges = useMemo(
    () => modifiedRows.size > 0 || pendingNewRows.length > 0,
    [modifiedRows.size, pendingNewRows.length],
  );

  /** Check if a row (by its data object) is a pending new row */
  const isPendingRow = useCallback(
    (row: TData): boolean => {
      if (!getRowId || pendingRowIdSet.size === 0) return false;
      return pendingRowIdSet.has(getRowId(row));
    },
    [getRowId, pendingRowIdSet],
  );

  /** Update a pending new row's cell value. Uses onPendingCellChange if provided. */
  const updatePendingRowCell = useCallback(
    (row: TData, columnId: string, newValue: unknown) => {
      const updatedRow = onPendingCellChange
        ? onPendingCellChange(row, columnId, newValue)
        : { ...row, [columnId]: newValue } as TData;

      if (!getRowId) return;
      const rowId = getRowId(row);
      setPendingNewRows((prev) =>
        prev.map((r) => (getRowId(r) === rowId ? updatedRow : r)),
      );
    },
    [onPendingCellChange, getRowId, setPendingNewRows],
  );

  /** Update an existing row's cell value in the modifiedRows map (deferred). */
  const updateModifiedRow = useCallback(
    (rowIndex: number, row: TData, columnId: string, newValue: unknown) => {
      const currentModified = modifiedRowsRef.current.get(rowIndex) ?? row;
      const updatedRow = onPendingCellChange
        ? onPendingCellChange(currentModified, columnId, newValue)
        : { ...currentModified, [columnId]: newValue } as TData;

      setModifiedRows((prev) => {
        const next = new Map(prev);
        next.set(rowIndex, updatedRow);
        return next;
      });
    },
    [onPendingCellChange],
  );

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

      const accessorKey = col.accessorKey ?? col.id;

      // Pending new row → update in pendingNewRows
      if (isPendingRow(row)) {
        updatePendingRowCell(row, accessorKey, newValue);
        setEditingCell(null);
        return;
      }

      // Existing row → store in modifiedRows (deferred commit)
      updateModifiedRow(rowIndex, row, accessorKey, newValue);
      setEditingCell(null);
    },
    [editingCell, data, columns, isPendingRow, updatePendingRowCell, updateModifiedRow],
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

      const accessorKey = col.accessorKey ?? col.id;

      if (isPendingRow(row)) {
        updatePendingRowCell(row, accessorKey, newValue);
      } else {
        // Existing row → store in modifiedRows (deferred commit)
        updateModifiedRow(rowIndex, row, accessorKey, newValue);
      }

      // Find the current column index and navigate to next editable cell
      const currentColIdx = columns.findIndex((c) => c.id === columnId);
      const nextCell = findNextEditableCell(currentColIdx, rowIndex);

      if (nextCell) {
        setEditingCell(nextCell);
      } else {
        setEditingCell(null);
      }
    },
    [editingCell, data, columns, findNextEditableCell, isPendingRow, updatePendingRowCell, updateModifiedRow],
  );

  /**
   * Request adding a new row.
   * Requires createEmptyRow to be provided.
   * Auto-starts editing the first editable cell of the new row.
   */
  const requestAddRow = useCallback(() => {
    if (!createEmptyRow) return;
    const newRow = createEmptyRow();
    setPendingNewRows((prev) => [...prev, newRow]);
    setEditMode(true);
    pendingEditAfterAdd.current = true;
  }, [createEmptyRow, setPendingNewRows]);

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

  /**
   * Commit all pending changes and exit edit mode.
   * Uses flushSync to avoid React batching issues when calling
   * onCellValueChange multiple times for different rows.
   */
  const saveAllChanges = useCallback(() => {
    const currentModified = modifiedRowsRef.current;

    // Commit modified existing rows via onCellValueChange
    if (currentModified.size > 0 && onCellValueChangeRef.current) {
      currentModified.forEach((modifiedRow, rowIndex) => {
        const originalRow = data[rowIndex];
        if (!originalRow) return;

        // Find changed columns and commit each
        columns.forEach((col) => {
          const accessorKey = col.accessorKey ?? col.id;
          const oldVal = col.accessorFn
            ? col.accessorFn(originalRow)
            : (originalRow as Record<string, unknown>)[accessorKey];
          const newVal = col.accessorFn
            ? col.accessorFn(modifiedRow)
            : (modifiedRow as Record<string, unknown>)[accessorKey];

          if (oldVal !== newVal) {
            flushSync(() => {
              onCellValueChangeRef.current!(originalRow, accessorKey, newVal, oldVal);
            });
          }
        });
      });
    }

    // Commit pending new rows
    const currentPendingRows = pendingNewRowsRef.current;
    if (currentPendingRows.length > 0 && onNewRowSave) {
      onNewRowSave(currentPendingRows);
    }

    // Clean up all state
    setModifiedRows(new Map());
    setPendingNewRows([]);
    setEditingCell(null);
    setEditMode(false);

    // Notify parent that save completed
    onEditSave?.();
  }, [columns, data, onNewRowSave, setPendingNewRows, onEditSave]);

  /**
   * Discard all pending changes and exit edit mode.
   * Fully internal: clears modifiedRows + pendingNewRows.
   * Consumer does NOT need to handle cancel.
   */
  const cancelAllChanges = useCallback(() => {
    setPendingNewRows([]);
    setModifiedRows(new Map());
    setEditingCell(null);
    setEditMode(false);
  }, [setPendingNewRows]);

  const hasPendingChange = useCallback(
    (rowIndex: number, columnId: string): boolean => {
      const modifiedRow = modifiedRows.get(rowIndex);
      if (!modifiedRow) return false;
      const col = columns.find((c) => c.id === columnId);
      if (!col) return false;
      const accessorKey = col.accessorKey ?? col.id;
      const originalRow = data[rowIndex];
      if (!originalRow) return false;
      const origVal = col.accessorFn
        ? col.accessorFn(originalRow)
        : (originalRow as Record<string, unknown>)[accessorKey];
      const modVal = col.accessorFn
        ? col.accessorFn(modifiedRow)
        : (modifiedRow as Record<string, unknown>)[accessorKey];
      return origVal !== modVal;
    },
    [modifiedRows, columns, data],
  );

  const getPendingValue = useCallback(
    (rowIndex: number, columnId: string): unknown | undefined => {
      const modifiedRow = modifiedRows.get(rowIndex);
      if (!modifiedRow) return undefined;
      const col = columns.find((c) => c.id === columnId);
      if (!col) return undefined;
      const accessorKey = col.accessorKey ?? col.id;
      return col.accessorFn
        ? col.accessorFn(modifiedRow)
        : (modifiedRow as Record<string, unknown>)[accessorKey];
    },
    [modifiedRows, columns],
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
