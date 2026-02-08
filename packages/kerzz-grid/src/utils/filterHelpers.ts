import type {
  ActiveDropdownFilter,
  ActiveInputFilter,
  ActiveDateTreeFilter,
  FilterCondition,
  ActiveFilter,
} from '../types/filter.types';
import type { GridLocale } from '../types/locale.types';

/**
 * Check if a cell value passes the active filter.
 */
export function matchesFilter(
  cellValue: unknown,
  filter: ActiveFilter,
): boolean {
  if (filter.type === 'dropdown') {
    return matchesDropdownFilter(cellValue, filter);
  }
  if (filter.type === 'dateTree') {
    return matchesDateTreeFilter(cellValue, filter);
  }
  if (filter.type === 'numeric') {
    return matchesNumericFilter(cellValue, filter);
  }
  return matchesInputFilter(cellValue, filter);
}

function matchesDropdownFilter(
  cellValue: unknown,
  filter: ActiveDropdownFilter,
): boolean {
  const isBlank = cellValue == null || String(cellValue).trim() === '';

  if (isBlank) {
    return filter.showBlanks;
  }

  return filter.selectedValues.has(String(cellValue));
}

function matchesInputFilter(
  cellValue: unknown,
  filter: ActiveInputFilter,
): boolean {
  const { condition, value, valueTo } = filter;

  if (!value && condition !== 'today' && condition !== 'thisWeek' && condition !== 'blank' && condition !== 'notBlank') {
    return true; // No filter value, pass everything
  }

  return applyCondition(cellValue, condition, value, valueTo);
}

function matchesNumericFilter(
  cellValue: unknown,
  filter: ActiveFilter,
): boolean {
  if (filter.type !== 'numeric') return false;
  const { condition, value, valueTo } = filter;

  if (!value) {
    return true; // No filter value, pass everything
  }

  return applyCondition(cellValue, condition, value, valueTo);
}

function applyCondition(
  cellValue: unknown,
  condition: FilterCondition,
  filterValue: string,
  filterValueTo?: string,
): boolean {
  const strCell = String(cellValue ?? '').toLowerCase();
  const strFilter = filterValue.toLowerCase();

  switch (condition) {
    case 'contains':
      return strCell.includes(strFilter);
    case 'equals':
      return strCell === strFilter;
    case 'startsWith':
      return strCell.startsWith(strFilter);
    case 'endsWith':
      return strCell.endsWith(strFilter);
    case 'notContains':
      return !strCell.includes(strFilter);
    case 'notEqual':
      return strCell !== strFilter;
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
    case 'greaterThanOrEqual': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell >= numFilter;
    }
    case 'lessThanOrEqual': {
      const numCell = Number(cellValue);
      const numFilter = Number(filterValue);
      return !isNaN(numCell) && !isNaN(numFilter) && numCell <= numFilter;
    }
    case 'between': {
      const numCell = Number(cellValue);
      const numFrom = Number(filterValue);
      const numTo = Number(filterValueTo ?? '');
      return (
        !isNaN(numCell) &&
        !isNaN(numFrom) &&
        !isNaN(numTo) &&
        numCell >= numFrom &&
        numCell <= numTo
      );
    }
    case 'before': {
      const d1 = new Date(String(cellValue));
      const d2 = new Date(filterValue);
      return !isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d1 < d2;
    }
    case 'after': {
      const d1 = new Date(String(cellValue));
      const d2 = new Date(filterValue);
      return !isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d1 > d2;
    }
    case 'today': {
      const d = new Date(String(cellValue));
      const today = new Date();
      return (
        !isNaN(d.getTime()) &&
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }
    case 'thisWeek': {
      const d = new Date(String(cellValue));
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return d >= startOfWeek && d < endOfWeek;
    }
    case 'blank':
      return cellValue == null || String(cellValue).trim() === '';
    case 'notBlank':
      return cellValue != null && String(cellValue).trim() !== '';
    default:
      return true;
  }
}

function matchesDateTreeFilter(
  cellValue: unknown,
  filter: ActiveDateTreeFilter,
): boolean {
  const isBlank = cellValue == null || String(cellValue).trim() === '';
  if (isBlank) return filter.showBlanks;

  const d = new Date(String(cellValue));
  if (isNaN(d.getTime())) return false;

  const dayKey = formatDayKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return filter.selectedDays.has(dayKey);
}

/**
 * Format a day key as "YYYY-MM-DD".
 */
export function formatDayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Date tree node types for hierarchical date filter.
 */
export interface DateTreeYearNode {
  year: number;
  months: DateTreeMonthNode[];
}

export interface DateTreeMonthNode {
  month: number;
  days: number[];
}

export interface DateTreeResult {
  years: DateTreeYearNode[];
  allDayKeys: string[];
}

/**
 * Build a hierarchical date tree (Year > Month > Day) from data column values.
 */
export function buildDateTree<TData>(
  data: TData[],
  accessorKey: string,
  accessorFn?: (row: TData) => unknown,
): DateTreeResult {
  const yearMap = new Map<number, Map<number, Set<number>>>();

  for (let i = 0; i < data.length; i++) {
    const raw = accessorFn
      ? accessorFn(data[i])
      : (data[i] as Record<string, unknown>)[accessorKey];

    if (raw == null || String(raw).trim() === '') continue;

    const d = new Date(String(raw));
    if (isNaN(d.getTime())) continue;

    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

    if (!yearMap.has(y)) yearMap.set(y, new Map());
    const monthMap = yearMap.get(y)!;
    if (!monthMap.has(m)) monthMap.set(m, new Set());
    monthMap.get(m)!.add(day);
  }

  const allDayKeys: string[] = [];

  const years: DateTreeYearNode[] = Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([month, daySet]) => {
          const days = Array.from(daySet).sort((a, b) => a - b);
          for (const day of days) {
            allDayKeys.push(formatDayKey(year, month, day));
          }
          return { month, days };
        }),
    }));

  return { years, allDayKeys };
}

/**
 * Get unique values and their counts from a data column.
 */
export function getColumnUniqueValues<TData>(
  data: TData[],
  accessorKey: string,
  accessorFn?: (row: TData) => unknown,
): { value: string; displayValue: string; count: number }[] {
  const counts = new Map<string, number>();

  for (let i = 0; i < data.length; i++) {
    const raw = accessorFn
      ? accessorFn(data[i])
      : (data[i] as Record<string, unknown>)[accessorKey];
    const key = raw == null || String(raw).trim() === '' ? '' : String(raw);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: { value: string; displayValue: string; count: number }[] = [];

  // Sort alphabetically, blanks last
  const entries = Array.from(counts.entries()).sort((a, b) => {
    if (a[0] === '') return 1;
    if (b[0] === '') return -1;
    return a[0].localeCompare(b[0]);
  });

  for (const [value, count] of entries) {
    if (value !== '') {
      result.push({ value, displayValue: value, count });
    }
  }

  return result;
}

/**
 * Get a human-readable summary of an active filter for display in filter chips.
 */
export function getFilterSummary(filter: ActiveFilter, locale: GridLocale): string {
  switch (filter.type) {
    case 'dropdown': {
      const count = filter.selectedValues.size;
      if (count === 1) {
        return Array.from(filter.selectedValues)[0];
      }
      return `${count} ${locale.filterSelected}`;
    }
    case 'input':
    case 'numeric': {
      const conditionLabel = getConditionLabel(filter.condition, locale);
      if (filter.condition === 'between' && filter.valueTo) {
        return `${conditionLabel}: ${filter.value} - ${filter.valueTo}`;
      }
      if (filter.condition === 'blank' || filter.condition === 'notBlank') {
        return conditionLabel;
      }
      return `${conditionLabel}: ${filter.value}`;
    }
    case 'dateTree': {
      const count = filter.selectedDays.size;
      if (count === 1) {
        return Array.from(filter.selectedDays)[0];
      }
      return `${count} ${locale.filterDaysSelected}`;
    }
    default:
      return '';
  }
}

function getConditionLabel(condition: FilterCondition, locale: GridLocale): string {
  const map: Record<string, string> = {
    contains: locale.filterContains,
    equals: locale.filterEquals,
    startsWith: locale.filterStartsWith,
    endsWith: locale.filterEndsWith,
    notContains: locale.filterNotContains,
    greaterThan: locale.filterGreaterThan,
    lessThan: locale.filterLessThan,
    greaterThanOrEqual: locale.filterGreaterThanOrEqual,
    lessThanOrEqual: locale.filterLessThanOrEqual,
    between: locale.filterBetween,
    notEqual: locale.filterNotEqual,
    before: locale.filterBefore,
    after: locale.filterAfter,
    today: locale.filterToday,
    thisWeek: locale.filterThisWeek,
    blank: locale.filterBlank,
    notBlank: locale.filterNotBlank,
  };
  return map[condition] ?? condition;
}

/**
 * Count blank values in a data column.
 */
export function countBlanks<TData>(
  data: TData[],
  accessorKey: string,
  accessorFn?: (row: TData) => unknown,
): number {
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    const raw = accessorFn
      ? accessorFn(data[i])
      : (data[i] as Record<string, unknown>)[accessorKey];
    if (raw == null || String(raw).trim() === '') count++;
  }
  return count;
}
