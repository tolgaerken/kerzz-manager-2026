import { useCallback } from 'react';
import type { GridColumnDef } from '../types/column.types';

/**
 * Provides cell navigation logic for grid editing.
 * Finds the next editable cell in a given direction.
 */
export function useCellNavigation<TData>(
  columns: GridColumnDef<TData>[],
  data: TData[],
) {
  /**
   * Find the next editable column index after the given column index.
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
   * Find the next editable cell (columnId) starting from a given column index and row.
   * If no editable cell found in current row, wraps to next row.
   * Returns null if no more editable cells.
   */
  const findNextEditableCell = useCallback(
    (
      currentColIdx: number,
      rowIndex: number,
    ): { rowIndex: number; columnId: string } | null => {
      // Try next editable cell in the same row
      const nextColIdx = findNextEditableColumnIndex(currentColIdx + 1, rowIndex);
      if (nextColIdx !== -1) {
        return { rowIndex, columnId: columns[nextColIdx].id };
      }

      // Try first editable cell in the next row
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex < data.length) {
        const firstColIdx = findNextEditableColumnIndex(0, nextRowIndex);
        if (firstColIdx !== -1) {
          return { rowIndex: nextRowIndex, columnId: columns[firstColIdx].id };
        }
      }

      return null;
    },
    [findNextEditableColumnIndex, columns, data],
  );

  return {
    findNextEditableColumnIndex,
    findNextEditableCell,
  };
}
