import React from 'react';
import type { ActiveFilter } from '../../types/filter.types';
import type { GridLocale } from '../../types/locale.types';
import { getFilterSummary } from '../../utils/filterHelpers';

interface FilterChipProps {
  columnId: string;
  columnHeader: string;
  filter: ActiveFilter;
  isEnabled: boolean;
  locale: GridLocale;
  onToggle: (columnId: string) => void;
  onRemove: (columnId: string) => void;
}

export const FilterChip = React.memo(function FilterChip({
  columnId,
  columnHeader,
  filter,
  isEnabled,
  locale,
  onToggle,
  onRemove,
}: FilterChipProps) {
  const summary = getFilterSummary(filter, locale);

  return (
    <div
      className={`kz-filter-chip ${isEnabled ? '' : 'kz-filter-chip--disabled'}`}
    >
      <button
        type="button"
        className="kz-filter-chip__toggle"
        onClick={() => onToggle(columnId)}
        title={isEnabled ? locale.filterEnabled : locale.filterDisabled}
      >
        {isEnabled ? (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.5 8C1.5 8 3.5 3.5 8 3.5C12.5 3.5 14.5 8 14.5 8C14.5 8 12.5 12.5 8 12.5C3.5 12.5 1.5 8 1.5 8Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="8"
              cy="8"
              r="2"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 2L14 14"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M6.5 6.67C5.9 7.1 5.5 7.5 5.5 8C5.5 9.38 6.62 10.5 8 10.5C8.5 10.5 8.9 10.1 9.33 9.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M1.5 8C1.5 8 3.5 3.5 8 3.5C9 3.5 9.9 3.8 10.7 4.2"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M14.5 8C14.5 8 12.5 12.5 8 12.5C7 12.5 6.1 12.2 5.3 11.8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      <span className="kz-filter-chip__label">
        <span className="kz-filter-chip__column">{columnHeader}:</span>
        {' '}
        <span className="kz-filter-chip__value">{summary}</span>
      </span>
      <button
        type="button"
        className="kz-filter-chip__remove"
        onClick={() => onRemove(columnId)}
        title={locale.filterClear}
      >
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
});
