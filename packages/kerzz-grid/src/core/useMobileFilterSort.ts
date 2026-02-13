import { useState, useMemo, useCallback } from 'react';
import type {
  MobileFilterColumnConfig,
  MobileSortColumnConfig,
  MobileFilterState,
  MobileSortState,
  MobileActiveFilter,
  MobileDropdownOption,
  MobileFilterCondition,
  UseMobileFilterSortOptions,
  UseMobileFilterSortReturn,
} from '../types/mobile-filter.types';

// ── i18n ──

const LOCALE_LABELS = {
  tr: {
    ascending: 'artan',
    descending: 'azalan',
    sortBy: 'göre',
  },
  en: {
    ascending: 'ascending',
    descending: 'descending',
    sortBy: 'by',
  },
} as const;

// ── Helper Functions ──

/**
 * Bir satırdan accessor key ile değer okur
 */
function getRowValue<TData>(row: TData, accessorKey: string): unknown {
  return (row as Record<string, unknown>)[accessorKey];
}

/**
 * Değerin boş olup olmadığını kontrol eder
 */
function isBlankValue(value: unknown): boolean {
  return value == null || String(value).trim() === '';
}

/**
 * Select tipi için unique değerleri ve sayılarını hesaplar
 */
function computeSelectOptions<TData>(
  data: TData[],
  accessorKey: string,
): MobileDropdownOption[] {
  const counts = new Map<string, number>();

  for (const row of data) {
    const raw = getRowValue(row, accessorKey);
    const key = isBlankValue(raw) ? '' : String(raw);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: MobileDropdownOption[] = [];

  // Alfabetik sırala, boşlar en sonda
  const entries = Array.from(counts.entries()).sort((a, b) => {
    if (a[0] === '') return 1;
    if (b[0] === '') return -1;
    return a[0].localeCompare(b[0], 'tr');
  });

  for (const [value, count] of entries) {
    if (value !== '') {
      result.push({ value, label: value, count });
    }
  }

  return result;
}

/**
 * Koşula göre filtreleme yapar
 */
function matchesCondition(
  cellValue: unknown,
  condition: MobileFilterCondition,
  filterValue?: string | number | boolean,
  filterValueTo?: string | number,
): boolean {
  const isBlank = isBlankValue(cellValue);

  // Blank/NotBlank koşulları
  if (condition === 'blank') return isBlank;
  if (condition === 'notBlank') return !isBlank;

  // Boş hücre diğer koşullara uymaz
  if (isBlank) return false;

  const strCell = String(cellValue).toLowerCase();
  const strFilter = filterValue !== undefined ? String(filterValue).toLowerCase() : '';

  switch (condition) {
    case 'contains':
      return strCell.includes(strFilter);

    case 'notContains':
      return !strCell.includes(strFilter);

    case 'equals':
      // Sayısal karşılaştırma
      if (typeof filterValue === 'number' || !isNaN(Number(filterValue))) {
        const numCell = Number(cellValue);
        const numFilter = Number(filterValue);
        if (!isNaN(numCell) && !isNaN(numFilter)) {
          return numCell === numFilter;
        }
      }
      // Boolean karşılaştırma
      if (typeof filterValue === 'boolean') {
        return cellValue === filterValue;
      }
      return strCell === strFilter;

    case 'notEquals':
      if (typeof filterValue === 'number' || !isNaN(Number(filterValue))) {
        const numCell = Number(cellValue);
        const numFilter = Number(filterValue);
        if (!isNaN(numCell) && !isNaN(numFilter)) {
          return numCell !== numFilter;
        }
      }
      if (typeof filterValue === 'boolean') {
        return cellValue !== filterValue;
      }
      return strCell !== strFilter;

    case 'startsWith':
      return strCell.startsWith(strFilter);

    case 'endsWith':
      return strCell.endsWith(strFilter);

    case 'greaterThan': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell > numFilter;
    }

    case 'lessThan': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell < numFilter;
    }

    case 'greaterOrEqual': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell >= numFilter;
    }

    case 'lessOrEqual': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell <= numFilter;
    }

    case 'between': {
      const numCell = Number(cellValue);
      const numFrom = Number(filterValue);
      const numTo = Number(filterValueTo);
      return (
        !isNaN(numCell) &&
        !isNaN(numFrom) &&
        !isNaN(numTo) &&
        numCell >= numFrom &&
        numCell <= numTo
      );
    }

    default:
      return true;
  }
}

/**
 * Bir satırın filtreye uyup uymadığını kontrol eder
 */
function matchesFilter<TData>(
  row: TData,
  filter: MobileActiveFilter,
  filterColumns: MobileFilterColumnConfig[],
): boolean {
  const column = filterColumns.find((c) => c.id === filter.columnId);
  if (!column) return true;

  const cellValue = getRowValue(row, column.accessorKey);
  return matchesCondition(cellValue, filter.condition, filter.value, filter.valueTo);
}

/**
 * İki değeri karşılaştırır (sıralama için)
 */
function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const aBlank = isBlankValue(a);
  const bBlank = isBlankValue(b);

  // Boş değerler her zaman sonda
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1;
  if (bBlank) return -1;

  // Sayısal karşılaştırma
  const aNum = Number(a);
  const bNum = Number(b);
  if (!isNaN(aNum) && !isNaN(bNum)) {
    const diff = aNum - bNum;
    return direction === 'asc' ? diff : -diff;
  }

  // String karşılaştırma
  const aStr = String(a);
  const bStr = String(b);
  const cmp = aStr.localeCompare(bStr, 'tr');
  return direction === 'asc' ? cmp : -cmp;
}

// ── Main Hook ──

export function useMobileFilterSort<TData>({
  data,
  filterColumns,
  sortColumns,
  locale = 'tr',
}: UseMobileFilterSortOptions<TData>): UseMobileFilterSortReturn<TData> {
  // Filter state
  const [filterState, setFilterState] = useState<MobileFilterState>({});

  // Sort state
  const [sortState, setSortState] = useState<MobileSortState>({
    columnId: null,
    direction: 'asc',
  });

  // Select options cache (data değiştiğinde yeniden hesaplanır)
  const selectOptionsCache = useMemo(() => {
    const cache = new Map<string, MobileDropdownOption[]>();
    for (const col of filterColumns) {
      if (col.type === 'select') {
        cache.set(col.id, computeSelectOptions(data, col.accessorKey));
      }
    }
    return cache;
  }, [data, filterColumns]);

  // Aktif filtre sayısı
  const activeFilterCount = useMemo(() => {
    return Object.keys(filterState).length;
  }, [filterState]);

  // Sıralama etiketi
  const sortLabel = useMemo(() => {
    if (!sortState.columnId) return null;
    const col = sortColumns.find((c) => c.id === sortState.columnId);
    if (!col) return null;
    const labels = LOCALE_LABELS[locale];
    const dirLabel = sortState.direction === 'asc' ? labels.ascending : labels.descending;
    return `${col.header} (${dirLabel})`;
  }, [sortState, sortColumns, locale]);

  // Filtrelenmiş ve sıralanmış data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filtreleme
    for (const filter of Object.values(filterState)) {
      result = result.filter((row) => matchesFilter(row, filter, filterColumns));
    }

    // Sıralama
    if (sortState.columnId) {
      const sortCol = sortColumns.find((c) => c.id === sortState.columnId);
      if (sortCol) {
        result.sort((a, b) => {
          const aVal = getRowValue(a, sortCol.accessorKey);
          const bVal = getRowValue(b, sortCol.accessorKey);
          return compareValues(aVal, bVal, sortState.direction);
        });
      }
    }

    return result;
  }, [data, filterState, sortState, filterColumns, sortColumns]);

  // Filtre ekle/güncelle
  const setFilter = useCallback((filter: MobileActiveFilter) => {
    setFilterState((prev) => ({
      ...prev,
      [filter.columnId]: filter,
    }));
  }, []);

  // Filtre kaldır
  const removeFilter = useCallback((columnId: string) => {
    setFilterState((prev) => {
      const next = { ...prev };
      delete next[columnId];
      return next;
    });
  }, []);

  // Tüm filtreleri temizle
  const clearAllFilters = useCallback(() => {
    setFilterState({});
  }, []);

  // Sıralama ayarla
  const setSort = useCallback((columnId: string | null, direction: 'asc' | 'desc') => {
    setSortState({ columnId, direction });
  }, []);

  // Sıralamayı kaldır
  const clearSort = useCallback(() => {
    setSortState({ columnId: null, direction: 'asc' });
  }, []);

  // Select options getter
  const getSelectOptions = useCallback(
    (columnId: string): MobileDropdownOption[] => {
      return selectOptionsCache.get(columnId) ?? [];
    },
    [selectOptionsCache],
  );

  return {
    filteredData,
    filterState,
    sortState,
    activeFilterCount,
    sortLabel,
    setFilter,
    removeFilter,
    clearAllFilters,
    setSort,
    clearSort,
    getSelectOptions,
  };
}
