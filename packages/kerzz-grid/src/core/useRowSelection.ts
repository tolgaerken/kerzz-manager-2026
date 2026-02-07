import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  UseRowSelectionProps,
  UseRowSelectionReturn,
  SelectionMode,
} from '../types/selection.types';

/**
 * Hook for managing row selection state
 * Supports single/multiple selection and shift+click range selection
 */
export function useRowSelection<TData>({
  data,
  getRowId,
  mode,
  selectedIds: controlledSelectedIds,
  defaultSelectedIds,
  onSelectionChange,
}: UseRowSelectionProps<TData>): UseRowSelectionReturn {
  // Determine if controlled or uncontrolled
  const isControlled = controlledSelectedIds !== undefined;

  // Internal state for uncontrolled mode
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    () => new Set(defaultSelectedIds ?? [])
  );

  // Last selected row ID for shift+click range selection
  const lastSelectedIdRef = useRef<string | null>(null);

  // Use controlled or internal state
  const selectedIds = useMemo(() => {
    if (isControlled) {
      return new Set(controlledSelectedIds);
    }
    return internalSelectedIds;
  }, [isControlled, controlledSelectedIds, internalSelectedIds]);

  // Sync controlled state changes
  useEffect(() => {
    if (isControlled) {
      setInternalSelectedIds(new Set(controlledSelectedIds));
    }
  }, [isControlled, controlledSelectedIds]);

  // Update selection and notify
  const updateSelection = useCallback(
    (newSelectedIds: Set<string>) => {
      if (!isControlled) {
        setInternalSelectedIds(newSelectedIds);
      }
      onSelectionChange?.(Array.from(newSelectedIds));
    },
    [isControlled, onSelectionChange]
  );

  // Check if a row is selected
  const isSelected = useCallback(
    (rowId: string): boolean => {
      return selectedIds.has(rowId);
    },
    [selectedIds]
  );

  // Toggle row selection
  const toggleRow = useCallback(
    (rowId: string, shiftKey = false) => {
      if (mode === 'none') return;

      const newSelectedIds = new Set(selectedIds);

      if (mode === 'single') {
        // Single selection mode - only one row at a time
        if (newSelectedIds.has(rowId)) {
          newSelectedIds.clear();
        } else {
          newSelectedIds.clear();
          newSelectedIds.add(rowId);
        }
        lastSelectedIdRef.current = rowId;
      } else if (mode === 'multiple') {
        // Multiple selection mode
        if (shiftKey && lastSelectedIdRef.current) {
          // Shift+click: select range
          const lastId = lastSelectedIdRef.current;
          const allIds = data.map(getRowId);
          const lastIdx = allIds.indexOf(lastId);
          const currentIdx = allIds.indexOf(rowId);

          if (lastIdx !== -1 && currentIdx !== -1) {
            const [start, end] =
              lastIdx < currentIdx
                ? [lastIdx, currentIdx]
                : [currentIdx, lastIdx];

            // Add all rows in range to selection
            for (let i = start; i <= end; i++) {
              newSelectedIds.add(allIds[i]);
            }
          }
        } else {
          // Normal click: toggle single row
          if (newSelectedIds.has(rowId)) {
            newSelectedIds.delete(rowId);
          } else {
            newSelectedIds.add(rowId);
          }
          lastSelectedIdRef.current = rowId;
        }
      }

      updateSelection(newSelectedIds);
    },
    [mode, selectedIds, data, getRowId, updateSelection]
  );

  // Select all rows
  const selectAll = useCallback(() => {
    if (mode !== 'multiple') return;

    const allIds = data.map(getRowId);
    const newSelectedIds = new Set(allIds);
    updateSelection(newSelectedIds);
  }, [mode, data, getRowId, updateSelection]);

  // Deselect all rows
  const deselectAll = useCallback(() => {
    const newSelectedIds = new Set<string>();
    lastSelectedIdRef.current = null;
    updateSelection(newSelectedIds);
  }, [updateSelection]);

  // Calculate derived state
  const totalCount = data.length;
  const selectedCount = selectedIds.size;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return {
    selectedIds,
    isSelected,
    toggleRow,
    selectAll,
    deselectAll,
    isAllSelected,
    isIndeterminate,
    selectedCount,
  };
}
