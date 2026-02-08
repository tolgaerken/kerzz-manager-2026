import { useMemo, useCallback } from 'react';
import type { GridColumnDef } from '../types/column.types';
import type { ActiveFilter, FilterState, DisabledFilterState } from '../types/filter.types';
import { matchesFilter } from '../utils/filterHelpers';

interface UseGridFilterOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
  filters: FilterState;
  disabledFilters: DisabledFilterState;
  onFiltersChange: (filters: FilterState) => void;
  onDisabledFiltersChange: (disabledFilters: DisabledFilterState) => void;
}

interface UseGridFilterReturn<TData> {
  filteredData: TData[];
  setFilter: (columnId: string, filter: ActiveFilter) => void;
  removeFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  disabledFilters: DisabledFilterState;
  toggleFilterEnabled: (columnId: string) => void;
}

export function useGridFilter<TData>({
  data,
  columns,
  filters,
  disabledFilters,
  onFiltersChange,
  onDisabledFiltersChange,
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
        // Skip disabled filters
        if (disabledFilters[columnId]) continue;

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
  }, [data, filters, disabledFilters, columnAccessors]);

  const setFilter = useCallback(
    (columnId: string, filter: ActiveFilter) => {
      onFiltersChange({ ...filters, [columnId]: filter });
    },
    [filters, onFiltersChange],
  );

  const removeFilter = useCallback(
    (columnId: string) => {
      const nextFilters = { ...filters };
      delete nextFilters[columnId];
      onFiltersChange(nextFilters);

      // Also remove from disabled filters
      if (disabledFilters[columnId]) {
        const nextDisabled = { ...disabledFilters };
        delete nextDisabled[columnId];
        onDisabledFiltersChange(nextDisabled);
      }
    },
    [filters, disabledFilters, onFiltersChange, onDisabledFiltersChange],
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
    onDisabledFiltersChange({});
  }, [onFiltersChange, onDisabledFiltersChange]);

  const toggleFilterEnabled = useCallback(
    (columnId: string) => {
      const next = { ...disabledFilters };
      if (next[columnId]) {
        delete next[columnId];
      } else {
        next[columnId] = true;
      }
      onDisabledFiltersChange(next);
    },
    [disabledFilters, onDisabledFiltersChange],
  );

  const activeFilterCount = useMemo(() => Object.keys(filters).length, [filters]);
  const hasActiveFilters = useMemo(() => activeFilterCount > 0, [activeFilterCount]);

  return {
    filteredData,
    setFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    disabledFilters,
    toggleFilterEnabled,
  };
}
