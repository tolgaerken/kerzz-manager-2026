import React from 'react';
import type { FilterCondition } from '../../types/filter.types';
import { useLocale } from '../../i18n/useLocale';

interface FilterConditionSelectProps {
  conditions: FilterCondition[];
  value: FilterCondition;
  onChange: (condition: FilterCondition) => void;
}

const conditionLocaleMap: Record<FilterCondition, string> = {
  contains: 'filterContains',
  equals: 'filterEquals',
  startsWith: 'filterStartsWith',
  endsWith: 'filterEndsWith',
  notContains: 'filterNotContains',
  greaterThan: 'filterGreaterThan',
  lessThan: 'filterLessThan',
  between: 'filterBetween',
  notEqual: 'filterNotEqual',
  before: 'filterBefore',
  after: 'filterAfter',
  today: 'filterToday',
  thisWeek: 'filterThisWeek',
  blank: 'filterBlank',
  notBlank: 'filterNotBlank',
};

export const FilterConditionSelect = React.memo(function FilterConditionSelect({
  conditions,
  value,
  onChange,
}: FilterConditionSelectProps) {
  const locale = useLocale();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FilterCondition)}
    >
      {conditions.map((cond) => (
        <option key={cond} value={cond}>
          {locale[conditionLocaleMap[cond] as keyof typeof locale] ?? cond}
        </option>
      ))}
    </select>
  );
});
