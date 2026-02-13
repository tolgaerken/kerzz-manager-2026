import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ActiveDateTreeFilter, DateTreeFilterConfig } from '../../types/filter.types';
import { buildDateTree, formatDayKey, countBlanks } from '../../utils/filterHelpers';
import { FilterDateTreeItem } from './FilterDateTreeItem';
import { useLocale } from '../../i18n/useLocale';

interface FilterDateTreeProps<TData> {
  column: GridColumnDef<TData>;
  data: TData[];
  filterConfig: DateTreeFilterConfig;
  activeFilter?: ActiveDateTreeFilter;
  onApply: (filter: ActiveDateTreeFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterDateTreeInner<TData>({
  column,
  data,
  filterConfig,
  activeFilter,
  onApply,
  onClear,
  onClose,
}: FilterDateTreeProps<TData>) {
  const locale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const monthNames = useMemo(() => locale.filterMonths.split(','), [locale.filterMonths]);

  // Build tree structure from data (use filterAccessorFn if provided for computed/lookup columns)
  const tree = useMemo(
    () =>
      buildDateTree(
        data,
        (column.accessorKey ?? column.id) as string,
        column.accessorFn as ((row: TData) => unknown) | undefined,
        column.filterAccessorFn as ((row: TData) => unknown) | undefined,
      ),
    [data, column],
  );

  const blanksCount = useMemo(
    () =>
      filterConfig.showBlanks !== false
        ? countBlanks(
            data,
            (column.accessorKey ?? column.id) as string,
            column.accessorFn as ((row: TData) => unknown) | undefined,
            column.filterAccessorFn as ((row: TData) => unknown) | undefined,
          )
        : 0,
    [data, column, filterConfig.showBlanks],
  );

  // Local state
  const [selectedDays, setSelectedDays] = useState<Set<string>>(() => {
    if (activeFilter) return new Set(activeFilter.selectedDays);
    return new Set(tree.allDayKeys);
  });

  const [showBlanks, setShowBlanks] = useState(
    activeFilter ? activeFilter.showBlanks : true,
  );

  const [expandedYears, setExpandedYears] = useState<Set<number>>(() => new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => new Set());

  // Derived: Select All state
  const hasBlanks = filterConfig.showBlanks !== false && blanksCount > 0;
  const allSelected =
    selectedDays.size === tree.allDayKeys.length &&
    (!hasBlanks || showBlanks);
  const noneSelected = selectedDays.size === 0 && !showBlanks;
  const someSelected = !allSelected && !noneSelected;

  // --- Handlers ---

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedDays(new Set());
      setShowBlanks(false);
    } else {
      setSelectedDays(new Set(tree.allDayKeys));
      setShowBlanks(true);
    }
  }, [allSelected, tree.allDayKeys]);

  const getDayKeysForYear = useCallback(
    (year: number) => tree.allDayKeys.filter((k) => k.startsWith(`${year}-`)),
    [tree.allDayKeys],
  );

  const getDayKeysForMonth = useCallback(
    (year: number, month: number) => {
      const prefix = `${year}-${String(month).padStart(2, '0')}-`;
      return tree.allDayKeys.filter((k) => k.startsWith(prefix));
    },
    [tree.allDayKeys],
  );

  const handleYearToggle = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }, []);

  const handleMonthToggle = useCallback((year: number, month: number) => {
    const key = `${year}-${month}`;
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleYearCheck = useCallback(
    (year: number, checked: boolean) => {
      const yearDays = getDayKeysForYear(year);
      setSelectedDays((prev) => {
        const next = new Set(prev);
        for (const day of yearDays) {
          if (checked) next.add(day);
          else next.delete(day);
        }
        return next;
      });
    },
    [getDayKeysForYear],
  );

  const handleMonthCheck = useCallback(
    (year: number, month: number, checked: boolean) => {
      const monthDays = getDayKeysForMonth(year, month);
      setSelectedDays((prev) => {
        const next = new Set(prev);
        for (const day of monthDays) {
          if (checked) next.add(day);
          else next.delete(day);
        }
        return next;
      });
    },
    [getDayKeysForMonth],
  );

  const handleDayCheck = useCallback((dayKey: string, checked: boolean) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (checked) next.add(dayKey);
      else next.delete(dayKey);
      return next;
    });
  }, []);

  const handleApply = useCallback(() => {
    const isAllSelected =
      selectedDays.size === tree.allDayKeys.length &&
      (!hasBlanks || showBlanks);

    if (isAllSelected) {
      onClear();
    } else {
      onApply({
        type: 'dateTree',
        selectedDays: new Set(selectedDays),
        showBlanks,
      });
    }
    onClose();
  }, [selectedDays, showBlanks, tree.allDayKeys.length, hasBlanks, onApply, onClear, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div className="kz-filter-dropdown kz-filter-date-tree" ref={dropdownRef}>
      {/* Select All */}
      <div className="kz-filter-date-tree__select-all">
        <FilterDateTreeItem
          label={locale.filterSelectAll}
          checked={allSelected}
          indeterminate={someSelected}
          onChange={handleSelectAll}
        />
      </div>

      <div className="kz-filter-date-tree__separator" />

      {/* Tree */}
      <div className="kz-filter-dropdown__list">
        {tree.years.map((yearData) => {
          const yearDays = getDayKeysForYear(yearData.year);
          const yearSelectedCount = yearDays.filter((d) => selectedDays.has(d)).length;
          const yearChecked = yearSelectedCount === yearDays.length;
          const yearIndeterminate = yearSelectedCount > 0 && yearSelectedCount < yearDays.length;
          const yearExpanded = expandedYears.has(yearData.year);

          return (
            <div key={yearData.year}>
              <FilterDateTreeItem
                label={String(yearData.year)}
                checked={yearChecked}
                indeterminate={yearIndeterminate}
                expandable
                expanded={yearExpanded}
                onToggle={() => handleYearToggle(yearData.year)}
                onChange={() => handleYearCheck(yearData.year, !yearChecked)}
                level={0}
              />

              {yearExpanded &&
                yearData.months.map((monthData) => {
                  const monthDays = getDayKeysForMonth(yearData.year, monthData.month);
                  const monthSelectedCount = monthDays.filter((d) => selectedDays.has(d)).length;
                  const monthChecked = monthSelectedCount === monthDays.length;
                  const monthIndeterminate =
                    monthSelectedCount > 0 && monthSelectedCount < monthDays.length;
                  const monthExpanded = expandedMonths.has(`${yearData.year}-${monthData.month}`);

                  return (
                    <div key={monthData.month}>
                      <FilterDateTreeItem
                        label={monthNames[monthData.month - 1] ?? String(monthData.month)}
                        checked={monthChecked}
                        indeterminate={monthIndeterminate}
                        expandable
                        expanded={monthExpanded}
                        onToggle={() => handleMonthToggle(yearData.year, monthData.month)}
                        onChange={() =>
                          handleMonthCheck(yearData.year, monthData.month, !monthChecked)
                        }
                        level={1}
                      />

                      {monthExpanded &&
                        monthData.days.map((day) => {
                          const dayKey = formatDayKey(yearData.year, monthData.month, day);
                          return (
                            <FilterDateTreeItem
                              key={day}
                              label={String(day)}
                              checked={selectedDays.has(dayKey)}
                              onChange={() => handleDayCheck(dayKey, !selectedDays.has(dayKey))}
                              level={2}
                            />
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })}

        {/* Blanks */}
        {hasBlanks && (
          <FilterDateTreeItem
            label={locale.filterShowBlanks}
            checked={showBlanks}
            onChange={() => setShowBlanks(!showBlanks)}
            level={0}
            isBlank
          />
        )}
      </div>

      {/* Footer */}
      <div className="kz-filter-date-tree__footer">
        <button
          type="button"
          className="kz-filter-date-tree__btn kz-filter-date-tree__btn--ok"
          onClick={handleApply}
        >
          {locale.filterOk}
        </button>
        <button
          type="button"
          className="kz-filter-date-tree__btn kz-filter-date-tree__btn--cancel"
          onClick={handleCancel}
        >
          {locale.filterCancel}
        </button>
      </div>
    </div>
  );
}

export const FilterDateTree = React.memo(FilterDateTreeInner) as typeof FilterDateTreeInner;
