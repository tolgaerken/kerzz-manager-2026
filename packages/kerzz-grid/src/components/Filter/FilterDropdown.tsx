import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ActiveDropdownFilter, DropdownFilterConfig } from '../../types/filter.types';
import { getColumnUniqueValues, countBlanks } from '../../utils/filterHelpers';
import { FilterDropdownItem } from './FilterDropdownItem';
import { useLocale } from '../../i18n/useLocale';

interface FilterDropdownProps<TData> {
  column: GridColumnDef<TData>;
  data: TData[];
  filterConfig: DropdownFilterConfig;
  activeFilter?: ActiveDropdownFilter;
  onApply: (filter: ActiveDropdownFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterDropdownInner<TData>({
  column,
  data,
  filterConfig,
  activeFilter,
  onApply,
  onClear,
  onClose,
}: FilterDropdownProps<TData>) {
  const locale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isInitialRender = useRef(true);

  // Compute unique values (use filterAccessorFn if provided for computed/lookup columns)
  const uniqueValues = useMemo(
    () => getColumnUniqueValues(
      data,
      column.accessorKey ?? column.id,
      column.accessorFn as ((row: TData) => unknown) | undefined,
      column.filterAccessorFn as ((row: TData) => unknown) | undefined,
    ),
    [data, column],
  );

  // Always compute blanks count so we can always show the empty/filled options
  const blanksCount = useMemo(
    () => countBlanks(
      data,
      column.accessorKey ?? column.id,
      column.accessorFn as ((row: TData) => unknown) | undefined,
      column.filterAccessorFn as ((row: TData) => unknown) | undefined,
    ),
    [data, column],
  );

  const filledCount = useMemo(() => data.length - blanksCount, [data.length, blanksCount]);

  // Local state for selections
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() => {
    if (activeFilter) return new Set(activeFilter.selectedValues);
    return new Set(uniqueValues.map((v) => v.value));
  });
  const [showBlanks, setShowBlanks] = useState(
    activeFilter ? activeFilter.showBlanks : true,
  );

  // Filtered list based on search
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const term = searchTerm.toLowerCase();
    return uniqueValues.filter((v) =>
      v.displayValue.toLowerCase().includes(term),
    );
  }, [uniqueValues, searchTerm]);

  const handleItemChange = useCallback((value: string, checked: boolean) => {
    setSelectedValues((prev) => {
      const next = new Set(prev);
      if (checked) next.add(value);
      else next.delete(value);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedValues(new Set(filteredValues.map((v) => v.value)));
    setShowBlanks(true);
  }, [filteredValues]);

  const handleDeselectAll = useCallback(() => {
    setSelectedValues(new Set());
    setShowBlanks(false);
  }, []);

  // Check if all non-blank values are selected (for "Dolu Olanlar" toggle)
  const allNonBlanksSelected = useMemo(
    () => uniqueValues.length > 0 && uniqueValues.every((v) => selectedValues.has(v.value)),
    [uniqueValues, selectedValues],
  );

  const handleFilledToggle = useCallback(
    (_val: string, checked: boolean) => {
      if (checked) {
        setSelectedValues(new Set(uniqueValues.map((v) => v.value)));
      } else {
        setSelectedValues(new Set());
      }
    },
    [uniqueValues],
  );

  // Apply on change (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const allSelected =
      selectedValues.size === uniqueValues.length && showBlanks;
    if (allSelected) {
      onClear();
    } else {
      onApply({
        type: 'dropdown',
        selectedValues: new Set(selectedValues),
        showBlanks,
      });
    }
  }, [selectedValues, showBlanks, uniqueValues.length, onApply, onClear]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Use a slight delay so the toggle button click doesn't immediately close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div className="kz-filter-dropdown" ref={dropdownRef}>
      {/* Search */}
      <div className="kz-filter-dropdown__search">
        <input
          type="text"
          placeholder={locale.filterSearchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      {/* Actions */}
      <div className="kz-filter-dropdown__actions">
        <button
          type="button"
          className="kz-filter-dropdown__action-btn"
          onClick={handleSelectAll}
        >
          {locale.filterSelectAll}
        </button>
        <button
          type="button"
          className="kz-filter-dropdown__action-btn"
          onClick={handleDeselectAll}
        >
          {locale.filterDeselectAll}
        </button>
      </div>

      {/* Items list */}
      <div className="kz-filter-dropdown__list">
        {/* Always show Empty / Non-Empty options */}
        <FilterDropdownItem
          value="__blanks__"
          displayValue={locale.filterShowBlanks}
          count={blanksCount}
          checked={showBlanks}
          showCounts={filterConfig.showCounts !== false}
          isBlank
          onChange={(_val, checked) => setShowBlanks(checked)}
        />
        <FilterDropdownItem
          value="__filled__"
          displayValue={locale.filterShowFilled}
          count={filledCount}
          checked={allNonBlanksSelected}
          showCounts={filterConfig.showCounts !== false}
          isBlank
          onChange={handleFilledToggle}
        />

        {/* Unique values */}
        {filteredValues.map((item) => (
          <FilterDropdownItem
            key={item.value}
            value={item.value}
            displayValue={item.displayValue}
            count={item.count}
            checked={selectedValues.has(item.value)}
            showCounts={filterConfig.showCounts !== false}
            onChange={handleItemChange}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="kz-filter-dropdown__footer">
        <button
          type="button"
          className="kz-filter-dropdown__close-btn"
          onClick={onClose}
        >
          {locale.filterClose}
        </button>
      </div>
    </div>
  );
}

export const FilterDropdown = React.memo(FilterDropdownInner) as typeof FilterDropdownInner;
