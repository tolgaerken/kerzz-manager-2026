import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ActiveInputFilter, FilterCondition, InputFilterConfig } from '../../types/filter.types';
import { FilterConditionSelect } from './FilterConditionSelect';
import { FilterClearButton } from './FilterClearButton';
import { useLocale } from '../../i18n/useLocale';

interface FilterInputProps {
  filterConfig: InputFilterConfig;
  activeFilter?: ActiveInputFilter;
  onApply: (filter: ActiveInputFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

const defaultConditions: FilterCondition[] = [
  'contains',
  'equals',
  'startsWith',
  'endsWith',
  'notContains',
  'blank',
  'notBlank',
];

export function FilterInput({
  filterConfig,
  activeFilter,
  onApply,
  onClear,
  onClose,
}: FilterInputProps) {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const conditions = filterConfig.conditions ?? defaultConditions;
  const debounceMs = filterConfig.debounceMs ?? 300;

  const [condition, setCondition] = useState<FilterCondition>(
    activeFilter?.condition ?? conditions[0],
  );
  const [value, setValue] = useState(activeFilter?.value ?? '');
  const [valueTo, setValueTo] = useState(activeFilter?.valueTo ?? '');

  /** Conditions that don't require a value input */
  const isNoValueCondition = (cond: FilterCondition) =>
    cond === 'today' || cond === 'thisWeek' || cond === 'blank' || cond === 'notBlank';

  const applyFilter = useCallback(
    (cond: FilterCondition, val: string, valTo?: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!val && !isNoValueCondition(cond)) {
          onClear();
        } else {
          onApply({ type: 'input', condition: cond, value: val, valueTo: valTo });
        }
      }, debounceMs);
    },
    [onApply, onClear, debounceMs],
  );

  const handleConditionChange = useCallback(
    (cond: FilterCondition) => {
      setCondition(cond);
      applyFilter(cond, value, valueTo);
    },
    [value, valueTo, applyFilter],
  );

  const handleValueChange = useCallback(
    (val: string) => {
      setValue(val);
      applyFilter(condition, val, valueTo);
    },
    [condition, valueTo, applyFilter],
  );

  const handleValueToChange = useCallback(
    (val: string) => {
      setValueTo(val);
      applyFilter(condition, value, val);
    },
    [condition, value, applyFilter],
  );

  const handleClear = useCallback(() => {
    setValue('');
    setValueTo('');
    setCondition(conditions[0]);
    onClear();
  }, [conditions, onClear]);

  // Click outside - delay to prevent immediate close from toggle click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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
    <div className="kz-filter-input" ref={panelRef}>
      <FilterConditionSelect
        conditions={conditions}
        value={condition}
        onChange={handleConditionChange}
      />
      {!isNoValueCondition(condition) && (
        <div className="kz-filter-input__row">
          <input
            type="text"
            placeholder={locale.filterPlaceholder}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            autoFocus
          />
          {value && <FilterClearButton onClick={handleClear} title={locale.filterClear} />}
        </div>
      )}
      {condition === 'between' && (
        <div className="kz-filter-input__row">
          <span style={{ fontSize: '11px', color: 'var(--kz-text-muted)' }}>
            {locale.and}
          </span>
          <input
            type="text"
            placeholder={locale.filterPlaceholder}
            value={valueTo}
            onChange={(e) => handleValueToChange(e.target.value)}
          />
        </div>
      )}
      <div className="kz-filter-input__actions">
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
