import React from 'react';

interface FilterClearButtonProps {
  onClick: () => void;
  title?: string;
}

export const FilterClearButton = React.memo(function FilterClearButton({
  onClick,
  title = 'Clear',
}: FilterClearButtonProps) {
  return (
    <button
      className="kz-filter-clear-btn"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      type="button"
    >
      <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" strokeLinecap="round" />
      </svg>
    </button>
  );
});
