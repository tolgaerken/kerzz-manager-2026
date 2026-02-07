import React from 'react';

interface FilterDropdownItemProps {
  value: string;
  displayValue: string;
  count: number;
  checked: boolean;
  showCounts: boolean;
  isBlank?: boolean;
  onChange: (value: string, checked: boolean) => void;
}

export const FilterDropdownItem = React.memo(function FilterDropdownItem({
  value,
  displayValue,
  count,
  checked,
  showCounts,
  isBlank = false,
  onChange,
}: FilterDropdownItemProps) {
  return (
    <label
      className={`kz-filter-dropdown__item ${isBlank ? 'kz-filter-dropdown__item--blank' : ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
      />
      <span className="kz-filter-dropdown__item-label">{displayValue}</span>
      {showCounts && (
        <span className="kz-filter-dropdown__item-count">{count}</span>
      )}
    </label>
  );
});
