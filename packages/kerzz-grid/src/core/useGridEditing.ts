import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { EditingState, PendingChange, NavigationDirection } from '../types/editing.types';
import type { GridColumnDef } from '../types/column.types';
import { useCellNavigation } from './useCellNavigation';

export interface UseGridEditingProps<TData> {
  columns: GridColumnDef<TData>[];
  data: TData[];
  onCellValueChange?: (row: TData, columnId: string, newValue: unknown, oldValue: unknown) => void;
  onRowAdd?: () => void;
  onEditSave?: () => void;
  onEditCancel?: () => void;

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

  // Keep a ref to pendingNewRows for saveAllChanges to read latest
  const pendingNewRowsRef = useRef<TData[]>(pendingNewRows);
  pendingNewRowsRef.current = pendingNewRows;

  const { findNextEditableColumnIndex, findNextEditableCell } = useCellNavigation(columns, data);

  const hasPendingChanges = useMemo(
    () => pendingChanges.size > 0 || pendingNewRows.length > 0,
    [pendingChanges.size, pendingNewRows.length],
  );

  /** Check if a row (by its data object) is a pending new row */
  const isPendingRow = useCallback(
    (row: TData): boolean => {
      if (!getRowId || pendingRowIdSet.size === 0) return false;
      return pendingRowIdSet.has(getRowId(row));
    },
    [getRowId, pendingRowIdSet],
  );

  /** Update a pending row's cell value. Uses onPendingCellChange if provided. */
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

      // Check if this is a pending new row
      if (isPendingRow(row)) {
        updatePendingRowCell(row, col.accessorKey ?? col.id, newValue);
        setEditingCell(null);
        return;
      }

      // Get old value from original data
      const accessorKey = col.accessorKey ?? col.id;
      const oldValue = col.accessorFn
        ? col.accessorFn(row)
        : (row as Record<string, unknown>)[accessorKey];

      // Immediately fire onCellValueChange so the parent updates right away
      if (oldValue !== newValue && onCellValueChange) {
        onCellValueChange(row, accessorKey, newValue, oldValue);
      }

      setEditingCell(null);
    },
    [editingCell, data, columns, isPendingRow, updatePendingRowCell, onCellValueChange],
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

      // Check if this is a pending new row
      const accessorKey = col.accessorKey ?? col.id;
      if (isPendingRow(row)) {
        updatePendingRowCell(row, accessorKey, newValue);
      } else {
        // Immediately fire onCellValueChange
        const oldValue = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[accessorKey];

        if (oldValue !== newValue && onCellValueChange) {
          onCellValueChange(row, accessorKey, newValue, oldValue);
        }
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
    [editingCell, data, columns, findNextEditableCell, isPendingRow, updatePendingRowCell, onCellValueChange],
  );

  /**
   * Request adding a new row.
   * - If createEmptyRow is provided: creates a pending row internally (deferred save).
   * - Otherwise: emits onRowAdd so the parent adds the row immediately (legacy mode).
   * Auto-starts editing the first editable cell of the new row.
   */
  const requestAddRow = useCallback(() => {
    if (createEmptyRow) {
      const newRow = createEmptyRow();
      setPendingNewRows((prev) => [...prev, newRow]);
      setEditMode(true);
      pendingEditAfterAdd.current = true;
      return;
    }

    if (!onRowAdd) return;
    setEditMode(true);
    pendingEditAfterAdd.current = true;
    onRowAdd();
  }, [createEmptyRow, setPendingNewRows, onRowAdd]);

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

  // Sync pendingRef on pendingChanges updates
  useEffect(() => {
    pendingRef.current = pendingChanges;
  }, [pendingChanges]);

  const saveAllChanges = useCallback(() => {
    // Read from ref to get the absolute latest (including batched updates)
    const current = pendingRef.current;
    if (onCellValueChange) {
      current.forEach((change) => {
        onCellValueChange(change.row, change.columnId, change.newValue, change.oldValue);
      });
    }

    // Commit pending new rows
    const currentPendingRows = pendingNewRowsRef.current;
    if (currentPendingRows.length > 0 && onNewRowSave) {
      onNewRowSave(currentPendingRows);
    }

    // Clear pending new rows
    setPendingNewRows([]);

    const empty = new Map<string, PendingChange<TData>>();
    pendingRef.current = empty;
    setPendingChanges(empty);
    setEditingCell(null);
    setEditMode(false);

    // Notify parent that save completed
    onEditSave?.();
  }, [onCellValueChange, onNewRowSave, setPendingNewRows, onEditSave]);

  const cancelAllChanges = useCallback(() => {
    // Discard pending new rows
    setPendingNewRows([]);

    const empty = new Map<string, PendingChange<TData>>();
    pendingRef.current = empty;
    setPendingChanges(empty);
    setEditingCell(null);
    setEditMode(false);

    // Notify parent that cancel completed
    onEditCancel?.();
  }, [setPendingNewRows, onEditCancel]);

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
