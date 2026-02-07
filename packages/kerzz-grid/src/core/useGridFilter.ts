import { useMemo, useCallback } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { ActiveFilter, FilterState } from '../types/filter.types';
import { matchesFilter } from '../utils/filterHelpers';

interface UseGridFilterOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

interface UseGridFilterReturn<TData> {
  filteredData: TData[];
  setFilter: (columnId: string, filter: ActiveFilter) => void;
  removeFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

export function useGridFilter<TData>({
  data,
  columns,
  filters,
  onFiltersChange,
}: UseGridFilterOptions<TData>): UseGridFilterReturn<TData> {
  const columnAccessors = useMemo(() => {
    const map = new Map<
      string,
      { accessorKey?: string; accessorFn?: (row: TData) => unknown }
    >();
    for (const col of columns) {
      map.set(col.id, {
        accessorKey: col.accessorKey,
        accessorFn: col.accessorFn,
      });
    }
    return map;
  }, [columns]);

  const filteredData = useMemo(() => {
    const filterEntries = Object.entries(filters);
    if (filterEntries.length === 0) return data;

    return data.filter((row) => {
      for (const [columnId, filter] of filterEntries) {
        const accessor = columnAccessors.get(columnId);
        if (!accessor) continue;

        const cellValue = accessor.accessorFn
          ? accessor.accessorFn(row)
          : (row as Record<string, unknown>)[accessor.accessorKey ?? columnId];

        if (!matchesFilter(cellValue, filter)) {
          return false;
        }
      }
      return true;
    });
  }, [data, filters, columnAccessors]);

  const setFilter = useCallback(
    (columnId: string, filter: ActiveFilter) => {
      onFiltersChange({ ...filters, [columnId]: filter });
    },
    [filters, onFiltersChange],
  );

  const removeFilter = useCallback(
    (columnId: string) => {
      const next = { ...filters };
      delete next[columnId];
      onFiltersChange(next);
    },
    [filters, onFiltersChange],
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFilterCount = Object.keys(filters).length;

  return {
    filteredData,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters: activeFilterCount > 0,
    activeFilterCount,
  };
}
