import React, { useRef, useEffect, memo } from 'react';

interface FilterDateTreeItemProps {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  level?: number;
  isBlank?: boolean;
  onToggle?: () => void;
  onChange: () => void;
}

export const FilterDateTreeItem = memo(function FilterDateTreeItem({
  label,
  checked,
  indeterminate = false,
  expandable = false,
  expanded = false,
  level = 0,
  isBlank = false,
  onToggle,
  onChange,
}: FilterDateTreeItemProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const paddingLeft = 8 + level * 24;

  return (
    <div
      className={`kz-filter-date-tree__item ${isBlank ? 'kz-filter-date-tree__item--blank' : ''}`}
      style={{ paddingLeft }}
    >
      {expandable ? (
        <button
          type="button"
          className="kz-filter-date-tree__toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
        >
          <svg
            viewBox="0 0 10 10"
            className={`kz-filter-date-tree__arrow ${expanded ? 'kz-filter-date-tree__arrow--expanded' : ''}`}
          >
            <path d="M3 2L7 5L3 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      ) : (
        /* Spacer to keep alignment when not expandable but at a level with expandable siblings */
        level > 0 ? <span className="kz-filter-date-tree__spacer" /> : null
      )}

      <label className="kz-filter-date-tree__label">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className={isBlank ? 'kz-filter-date-tree__text--blank' : ''}>
          {label}
        </span>
      </label>
    </div>
  );
});
