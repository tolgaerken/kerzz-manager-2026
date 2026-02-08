import { useCallback, useMemo } from 'react';

interface UseColumnVisibilityOptions {
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
}

export interface UseColumnVisibilityReturn {
  isColumnVisible: (columnId: string) => boolean;
  toggleColumn: (columnId: string) => void;
  showAllColumns: (columnIds: string[]) => void;
  hideAllColumns: (columnIds: string[]) => void;
  visibleColumnCount: number;
}

export function useColumnVisibility({
  columnVisibility,
  onColumnVisibilityChange,
}: UseColumnVisibilityOptions): UseColumnVisibilityReturn {
  const isColumnVisible = useCallback(
    (columnId: string) => columnVisibility[columnId] !== false,
    [columnVisibility],
  );

  const toggleColumn = useCallback(
    (columnId: string) => {
      onColumnVisibilityChange({
        ...columnVisibility,
        [columnId]: !isColumnVisible(columnId),
      });
    },
    [columnVisibility, isColumnVisible, onColumnVisibilityChange],
  );

  const showAllColumns = useCallback(
    (columnIds: string[]) => {
      const next = { ...columnVisibility };
      for (const id of columnIds) next[id] = true;
      onColumnVisibilityChange(next);
    },
    [columnVisibility, onColumnVisibilityChange],
  );

  const hideAllColumns = useCallback(
    (columnIds: string[]) => {
      const next = { ...columnVisibility };
      for (const id of columnIds) next[id] = false;
      onColumnVisibilityChange(next);
    },
    [columnVisibility, onColumnVisibilityChange],
  );

  const visibleColumnCount = useMemo(
    () => Object.values(columnVisibility).filter((v) => v !== false).length,
    [columnVisibility],
  );

  return {
    isColumnVisible,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    visibleColumnCount,
  };
}
