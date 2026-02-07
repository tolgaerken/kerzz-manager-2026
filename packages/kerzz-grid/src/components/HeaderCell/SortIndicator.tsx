import React from 'react';

interface SortIndicatorProps {
  direction: 'asc' | 'desc' | null;
}

export const SortIndicator = React.memo(function SortIndicator({
  direction,
}: SortIndicatorProps) {
  if (!direction) return null;

  return (
    <span className="kz-sort-indicator" aria-label={direction === 'asc' ? 'Ascending' : 'Descending'}>
      <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
        {direction === 'asc' ? (
          <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
        ) : (
          <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />
        )}
      </svg>
    </span>
  );
});
