import { useState, useMemo, useCallback } from 'react';
import type { GridColumnDef } from '../types/column.types';

interface UseGlobalSearchOptions<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
}

export function useGlobalSearch<TData>({ data, columns }: UseGlobalSearchOptions<TData>) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lowerSearch = searchTerm.toLowerCase().trim();

    return data.filter((row) => {
      // Search across all columns
      for (const col of columns) {
        const value = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

        if (value == null) continue;

        const strValue = String(value).toLowerCase();
        if (strValue.includes(lowerSearch)) {
          return true;
        }
      }
      return false;
    });
  }, [data, columns, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    clearSearch,
    hasActiveSearch: searchTerm.trim().length > 0,
  };
}
