import React from 'react';
import type { ActiveFilter, FilterState, DisabledFilterState } from '../../types/filter.types';
import type { GridColumnDef } from '../../types/column.types';
import type { GridLocale } from '../../types/locale.types';
import { FilterChip } from './FilterChip';

interface ActiveFilterBarProps<TData> {
  filters: FilterState;
  disabledFilters: DisabledFilterState;
  columns: GridColumnDef<TData>[];
  locale: GridLocale;
  filteredRowCount: number;
  totalRowCount: number;
  onToggleFilter: (columnId: string) => void;
  onRemoveFilter: (columnId: string) => void;
  onClearAll: () => void;
}

function ActiveFilterBarInner<TData>({
  filters,
  disabledFilters,
  columns,
  locale,
  filteredRowCount,
  totalRowCount,
  onToggleFilter,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterBarProps<TData>) {
  const filterEntries = Object.entries(filters);
  if (filterEntries.length === 0) return null;

  // Build a map of column headers for display
  const columnHeaderMap = new Map<string, string>();
  for (const col of columns) {
    columnHeaderMap.set(col.id, col.header);
  }

  return (
    <div className="kz-active-filter-bar">
      <div className="kz-active-filter-bar__label">
        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.5 2.5H12.5L8.5 7.5V11L5.5 12.5V7.5L1.5 2.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{locale.activeFilters}:</span>
        <span className="kz-active-filter-bar__count">
          {filteredRowCount} {locale.of} {totalRowCount} {locale.items}
        </span>
      </div>
      <div className="kz-active-filter-bar__chips">
        {filterEntries.map(([columnId, filter]: [string, ActiveFilter]) => (
          <FilterChip
            key={columnId}
            columnId={columnId}
            columnHeader={columnHeaderMap.get(columnId) ?? columnId}
            filter={filter}
            isEnabled={!disabledFilters[columnId]}
            locale={locale}
            onToggle={onToggleFilter}
            onRemove={onRemoveFilter}
          />
        ))}
      </div>
      <button
        type="button"
        className="kz-active-filter-bar__clear-all"
        onClick={onClearAll}
        title={locale.clearAllFilters}
      >
        {locale.clearAllFilters}
      </button>
    </div>
  );
}

export const ActiveFilterBar = React.memo(ActiveFilterBarInner) as typeof ActiveFilterBarInner;
