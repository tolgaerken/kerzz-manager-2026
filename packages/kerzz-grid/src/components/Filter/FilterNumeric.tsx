import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ActiveNumericFilter, NumberFilterCondition, NumericFilterConfig } from '../../types/filter.types';
import { FilterClearButton } from './FilterClearButton';
import { useLocale } from '../../i18n/useLocale';

interface FilterNumericProps {
  filterConfig: NumericFilterConfig;
  activeFilter?: ActiveNumericFilter;
  onApply: (filter: ActiveNumericFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

const defaultConditions: NumberFilterCondition[] = [
  'equals',
  'notEqual',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'between',
];

interface OperatorOption {
  value: NumberFilterCondition;
  symbol: string;
}

const operatorSymbols: Record<NumberFilterCondition, string> = {
  equals: '=',
  notEqual: '≠',
  greaterThan: '>',
  lessThan: '<',
  greaterThanOrEqual: '≥',
  lessThanOrEqual: '≤',
  between: '↔',
};

function FilterNumericInner({
  filterConfig,
  activeFilter,
  onApply,
  onClear,
  onClose,
}: FilterNumericProps) {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const conditions = filterConfig.conditions ?? defaultConditions;
  const debounceMs = filterConfig.debounceMs ?? 300;

  const [condition, setCondition] = useState<NumberFilterCondition>(
    activeFilter?.condition ?? conditions[0],
  );
  const [value, setValue] = useState(activeFilter?.value ?? '');
  const [valueTo, setValueTo] = useState(activeFilter?.valueTo ?? '');
  const [valueError, setValueError] = useState(false);
  const [valueToError, setValueToError] = useState(false);

  const isValidNumber = useCallback((val: string): boolean => {
    if (!val.trim()) return false;
    const num = Number(val);
    return !isNaN(num) && isFinite(num);
  }, []);

  const applyFilter = useCallback(
    (cond: NumberFilterCondition, val: string, valTo?: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!val.trim()) {
          onClear();
          return;
        }

        // Validate value
        if (!isValidNumber(val)) {
          setValueError(true);
          return;
        }

        // Validate valueTo for between condition
        if (cond === 'between') {
          if (!valTo?.trim() || !isValidNumber(valTo)) {
            setValueToError(true);
            return;
          }
        }

        setValueError(false);
        setValueToError(false);
        onApply({ type: 'numeric', condition: cond, value: val, valueTo: valTo });
      }, debounceMs);
    },
    [onApply, onClear, debounceMs, isValidNumber],
  );

  const handleConditionChange = useCallback(
    (cond: NumberFilterCondition) => {
      setCondition(cond);
      setValueError(false);
      setValueToError(false);
      if (value) {
        applyFilter(cond, value, valueTo);
      }
    },
    [value, valueTo, applyFilter],
  );

  const handleValueChange = useCallback(
    (val: string) => {
      setValue(val);
      setValueError(false);
      if (val.trim()) {
        applyFilter(condition, val, valueTo);
      } else {
        onClear();
      }
    },
    [condition, valueTo, applyFilter, onClear],
  );

  const handleValueToChange = useCallback(
    (val: string) => {
      setValueTo(val);
      setValueToError(false);
      if (value) {
        applyFilter(condition, value, val);
      }
    },
    [condition, value, applyFilter],
  );

  const handleClear = useCallback(() => {
    setValue('');
    setValueTo('');
    setCondition(conditions[0]);
    setValueError(false);
    setValueToError(false);
    onClear();
  }, [conditions, onClear]);

  const getConditionLabel = useCallback(
    (cond: NumberFilterCondition): string => {
      const labelMap: Record<NumberFilterCondition, string> = {
        equals: locale.filterEquals,
        notEqual: locale.filterNotEqual,
        greaterThan: locale.filterGreaterThan,
        lessThan: locale.filterLessThan,
        greaterThanOrEqual: locale.filterGreaterThanOrEqual,
        lessThanOrEqual: locale.filterLessThanOrEqual,
        between: locale.filterBetween,
      };
      return labelMap[cond];
    },
    [locale],
  );

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

  const operators: OperatorOption[] = conditions.map((cond) => ({
    value: cond,
    symbol: operatorSymbols[cond],
  }));

  return (
    <div className="kz-filter-numeric" ref={panelRef}>
      <select
        className="kz-filter-numeric__operator"
        value={condition}
        onChange={(e) => handleConditionChange(e.target.value as NumberFilterCondition)}
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.symbol} {getConditionLabel(op.value)}
          </option>
        ))}
      </select>

      <div className="kz-filter-numeric__input-row">
        <input
          type="text"
          placeholder={locale.filterPlaceholder}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          className={valueError ? 'kz-filter-numeric__input--error' : ''}
          autoFocus
        />
        {value && <FilterClearButton onClick={handleClear} title={locale.filterClear} />}
      </div>

      {valueError && (
        <div className="kz-filter-numeric__error">{locale.filterInvalidNumber}</div>
      )}

      {condition === 'between' && (
        <>
          <div className="kz-filter-numeric__separator">
            <span>{locale.and}</span>
          </div>
          <div className="kz-filter-numeric__input-row">
            <input
              type="text"
              placeholder={locale.filterPlaceholder}
              value={valueTo}
              onChange={(e) => handleValueToChange(e.target.value)}
              className={valueToError ? 'kz-filter-numeric__input--error' : ''}
            />
          </div>
          {valueToError && (
            <div className="kz-filter-numeric__error">{locale.filterInvalidNumber}</div>
          )}
        </>
      )}

      <div className="kz-filter-numeric__actions">
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

export const FilterNumeric = React.memo(FilterNumericInner);
