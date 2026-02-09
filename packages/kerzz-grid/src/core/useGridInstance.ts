import { useMemo, useEffect, useCallback } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { GridProps } from '../types/grid.types';
import { useStateStore } from './useStateStore';
import { useGridFilter } from './useGridFilter';
import { useGlobalSearch } from './useGlobalSearch';
import { useVirtualization } from './useVirtualization';
import { useColumnResize } from './useColumnResize';
import { useColumnDrag } from './useColumnDrag';
import { useColumnVisibility } from './useColumnVisibility';
import { useFooterAggregation } from './useFooterAggregation';
import { useGridTheme } from '../theme/ThemeProvider';
import type { SortingState } from '@tanstack/react-table';

export function useGridInstance<TData>(props: GridProps<TData>, extraRowCount = 0) {
  const {
    data,
    columns,
    stateKey,
    stateStorage = 'localStorage',
    rowHeight: rowHeightProp,
    overscan,
    onSortChange,
    onFilterChange,
    onColumnOrderChange,
    onColumnVisibilityChange,
  } = props;

  const theme = useGridTheme();
  const effectiveRowHeight = rowHeightProp ?? theme.spacing.rowHeight;

  // State management
  const stateStore = useStateStore({
    stateKey,
    stateStorage,
    columns: columns as GridColumnDef[],
  });

  // Global search (first step - searches all columns)
  const globalSearch = useGlobalSearch({
    data,
    columns: columns as GridColumnDef<TData>[],
  });

  // Column lookup map for O(1) access during sorting
  const columnMap = useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns],
  );

  // Sorting (applied after global search)
  const sortedData = useMemo(() => {
    const dataToSort = globalSearch.filteredData;
    if (stateStore.state.sorting.length === 0) return dataToSort;

    const sortedArr = [...dataToSort];
    const sorting = stateStore.state.sorting;

    sortedArr.sort((a, b) => {
      for (const sort of sorting) {
        const col = columnMap.get(sort.id);
        if (!col) continue;

        const aVal = col.accessorFn
          ? col.accessorFn(a)
          : (a as Record<string, unknown>)[col.accessorKey ?? col.id];
        const bVal = col.accessorFn
          ? col.accessorFn(b)
          : (b as Record<string, unknown>)[col.accessorKey ?? col.id];

        let cmp = 0;
        if (aVal == null && bVal == null) cmp = 0;
        else if (aVal == null) cmp = -1;
        else if (bVal == null) cmp = 1;
        else if (typeof aVal === 'number' && typeof bVal === 'number')
          cmp = aVal - bVal;
        else cmp = String(aVal).localeCompare(String(bVal));

        if (cmp !== 0) return sort.desc ? -cmp : cmp;
      }
      return 0;
    });

    return sortedArr;
  }, [globalSearch.filteredData, stateStore.state.sorting, columnMap]);

  // Memoized callbacks for filter hook
  const handleFiltersChange = useCallback(
    (filters: import('../types/filter.types').FilterState) => {
      stateStore.setFilters(filters);
      onFilterChange?.(filters);
    },
    [stateStore.setFilters, onFilterChange],
  );

  const handleDisabledFiltersChange = useCallback(
    (disabled: import('../types/filter.types').DisabledFilterState) => {
      stateStore.setDisabledFilters(disabled);
    },
    [stateStore.setDisabledFilters],
  );

  // Column filtering (applied after sorting)
  const {
    filteredData,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    disabledFilters,
    toggleFilterEnabled,
  } = useGridFilter({
    data: sortedData,
    columns: columns as GridColumnDef<TData>[],
    filters: stateStore.state.filters,
    disabledFilters: stateStore.state.disabledFilters ?? {},
    onFiltersChange: handleFiltersChange,
    onDisabledFiltersChange: handleDisabledFiltersChange,
  });

  const normalizedColumnOrder = useMemo(() => {
    const order = stateStore.state.columnOrder;
    if (order.length === 0) return columns.map((c) => c.id);

    // Filter valid columns and remove duplicates
    const next = Array.from(new Set(order.filter((id) => columns.some((c) => c.id === id))));
    const seen = new Set(next);
    for (const col of columns) {
      if (!seen.has(col.id)) next.push(col.id);
    }
    return next;
  }, [columns, stateStore.state.columnOrder]);

  useEffect(() => {
    const current = stateStore.state.columnOrder;
    if (current.length === 0 && normalizedColumnOrder.length === 0) return;

    const isSameLength = current.length === normalizedColumnOrder.length;
    const isSameOrder = isSameLength && current.every((id, idx) => id === normalizedColumnOrder[idx]);
    if (!isSameOrder) {
      stateStore.setColumnOrder(normalizedColumnOrder);
    }
  }, [normalizedColumnOrder, stateStore.state.columnOrder, stateStore.setColumnOrder]);

  // Ordered & visible columns
  const orderedColumns = useMemo(() => {
    const visibility = stateStore.state.columnVisibility;
    const colMap = new Map(columns.map((c) => [c.id, c]));
    const ordered = normalizedColumnOrder
      .map((id) => colMap.get(id))
      .filter((c): c is GridColumnDef<TData> => c != null);
    return ordered.filter((c) => visibility[c.id] !== false);
  }, [columns, normalizedColumnOrder, stateStore.state.columnVisibility]);

  // Auto-detect numeric columns and resolve alignment
  const resolvedColumns = useMemo(() => {
    if (data.length === 0) return orderedColumns;

    // Find first non-null value for each column to detect type
    const sampleRow = data[0];

    return orderedColumns.map((col) => {
      // Skip columns with explicit align
      if (col.align) return col;

      const value = col.accessorFn
        ? col.accessorFn(sampleRow)
        : (sampleRow as Record<string, unknown>)[col.accessorKey ?? col.id];

      if (typeof value === 'number') {
        return { ...col, align: 'right' as const };
      }

      return col;
    });
  }, [orderedColumns, data]);

  // Virtualization
  const virtualization = useVirtualization({
    rowCount: filteredData.length + extraRowCount,
    rowHeight: effectiveRowHeight,
    overscan,
  });

  // Memoized callbacks for column hooks
  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => {
      stateStore.setColumnWidth(columnId, width);
    },
    [stateStore.setColumnWidth],
  );

  const handleColumnOrderChange = useCallback(
    (order: string[]) => {
      stateStore.setColumnOrder(order);
      onColumnOrderChange?.(order);
    },
    [stateStore.setColumnOrder, onColumnOrderChange],
  );

  const handleColumnVisibilityChange = useCallback(
    (visibility: Record<string, boolean>) => {
      stateStore.setColumnVisibility(visibility);
      onColumnVisibilityChange?.(visibility);
    },
    [stateStore.setColumnVisibility, onColumnVisibilityChange],
  );

  // Column resize
  const columnResize = useColumnResize({
    columnWidths: stateStore.state.columnWidths,
    onColumnWidthChange: handleColumnWidthChange,
  });

  // Column drag
  const columnDrag = useColumnDrag({
    columnOrder: normalizedColumnOrder,
    onColumnOrderChange: handleColumnOrderChange,
  });

  // Column visibility
  const columnVisibility = useColumnVisibility({
    columnVisibility: stateStore.state.columnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
  });

  // Footer aggregation (on filtered data)
  const footerAggregation = useFooterAggregation({
    data: filteredData,
    columns: orderedColumns,
  });

  // Sorting handler
  const handleSort = useCallback(
    (columnId: string) => {
      const current = stateStore.state.sorting;
      let next: SortingState;

      const existing = current.find((s) => s.id === columnId);
      if (!existing) {
        next = [{ id: columnId, desc: false }];
      } else if (!existing.desc) {
        next = [{ id: columnId, desc: true }];
      } else {
        next = [];
      }

      stateStore.setSorting(next);
      onSortChange?.(next);
    },
    [stateStore.state.sorting, stateStore.setSorting, onSortChange],
  );

  // Total row width (accounts for minWidth overriding width)
  const totalWidth = useMemo(() => {
    return orderedColumns.reduce((sum, col) => {
      const w = columnResize.getColumnWidth(col.id, col.width ?? 150);
      const min = col.minWidth ?? 50;
      return sum + Math.max(w, min);
    }, 0);
  }, [orderedColumns, columnResize]);

  return {
    // Data
    originalData: data,
    filteredData,
    orderedColumns: resolvedColumns,
    totalRowCount: data.length,
    filteredRowCount: filteredData.length,

    // Theme
    theme,
    effectiveRowHeight,

    // State
    state: stateStore.state,
    stateStore,
    resetState: stateStore.resetState,

    // Sorting
    sorting: stateStore.state.sorting,
    handleSort,

    // Global search
    searchTerm: globalSearch.searchTerm,
    setSearchTerm: globalSearch.setSearchTerm,
    clearSearch: globalSearch.clearSearch,
    hasActiveSearch: globalSearch.hasActiveSearch,

    // Filtering
    filters: stateStore.state.filters,
    disabledFilters,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    toggleFilterEnabled,

    // Virtualization
    ...virtualization,

    // Column management
    columnResize,
    columnDrag,
    columnVisibility,
    totalWidth,

    // Footer
    footerAggregation,
  };
}
