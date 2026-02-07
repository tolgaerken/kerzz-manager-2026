import { useMemo } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { GridProps } from '../types/grid.types';
import { useStateStore } from './useStateStore';
import { useGridFilter } from './useGridFilter';
import { useVirtualization } from './useVirtualization';
import { useColumnResize } from './useColumnResize';
import { useColumnDrag } from './useColumnDrag';
import { useColumnVisibility } from './useColumnVisibility';
import { useFooterAggregation } from './useFooterAggregation';
import { useGridTheme } from '../theme/ThemeProvider';
import type { SortingState } from '@tanstack/react-table';

export function useGridInstance<TData>(props: GridProps<TData>) {
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

  // Sorting
  const sortedData = useMemo(() => {
    if (stateStore.state.sorting.length === 0) return data;

    const sortedArr = [...data];
    const sorting = stateStore.state.sorting;

    sortedArr.sort((a, b) => {
      for (const sort of sorting) {
        const col = columns.find((c) => c.id === sort.id);
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
  }, [data, stateStore.state.sorting, columns]);

  // Filtering
  const { filteredData, setFilter, removeFilter, clearAllFilters, hasActiveFilters } =
    useGridFilter({
      data: sortedData,
      columns: columns as GridColumnDef<TData>[],
      filters: stateStore.state.filters,
      onFiltersChange: (filters) => {
        stateStore.setFilters(filters);
        onFilterChange?.(filters);
      },
    });

  // Ordered & visible columns
  const orderedColumns = useMemo(() => {
    const order = stateStore.state.columnOrder;
    const visibility = stateStore.state.columnVisibility;

    let ordered: GridColumnDef<TData>[];

    if (order.length > 0) {
      const colMap = new Map(columns.map((c) => [c.id, c]));
      ordered = order
        .map((id) => colMap.get(id))
        .filter((c): c is GridColumnDef<TData> => c != null);

      // Add any new columns not in stored order
      for (const col of columns) {
        if (!order.includes(col.id)) ordered.push(col);
      }
    } else {
      ordered = [...columns];
    }

    return ordered.filter((c) => visibility[c.id] !== false);
  }, [columns, stateStore.state.columnOrder, stateStore.state.columnVisibility]);

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
    rowCount: filteredData.length,
    rowHeight: effectiveRowHeight,
    overscan,
  });

  // Column resize
  const columnResize = useColumnResize({
    columnWidths: stateStore.state.columnWidths,
    onColumnWidthChange: (columnId, width) => {
      stateStore.setColumnWidth(columnId, width);
    },
  });

  // Column drag
  const columnDrag = useColumnDrag({
    columnOrder: stateStore.state.columnOrder.length > 0
      ? stateStore.state.columnOrder
      : columns.map((c) => c.id),
    onColumnOrderChange: (order) => {
      stateStore.setColumnOrder(order);
      onColumnOrderChange?.(order);
    },
  });

  // Column visibility
  const columnVisibility = useColumnVisibility({
    columnVisibility: stateStore.state.columnVisibility,
    onColumnVisibilityChange: (visibility) => {
      stateStore.setColumnVisibility(visibility);
      onColumnVisibilityChange?.(visibility);
    },
  });

  // Footer aggregation (on filtered data)
  const footerAggregation = useFooterAggregation({
    data: filteredData,
    columns: orderedColumns,
  });

  // Sorting handler
  const handleSort = (columnId: string) => {
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
  };

  // Total row width
  const totalWidth = useMemo(() => {
    return orderedColumns.reduce((sum, col) => {
      return sum + columnResize.getColumnWidth(col.id, col.width ?? 150);
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
    resetState: stateStore.resetState,

    // Sorting
    sorting: stateStore.state.sorting,
    handleSort,

    // Filtering
    filters: stateStore.state.filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,

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
