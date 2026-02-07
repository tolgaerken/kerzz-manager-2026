import React, { useRef, useEffect } from 'react';

interface SelectionHeaderCellProps {
  /** Whether all rows are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) rows are selected */
  isIndeterminate: boolean;
  /** Callback when checkbox is clicked */
  onToggleAll: () => void;
  /** Header height for consistent sizing */
  headerHeight?: number;
}

/**
 * Selection checkbox header cell
 * Shows "select all" checkbox with indeterminate state support
 * Positioned as sticky on the left side
 */
export function SelectionHeaderCell({
  isAllSelected,
  isIndeterminate,
  onToggleAll,
  headerHeight,
}: SelectionHeaderCellProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Handle indeterminate state (can't be set via attribute)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleAll();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="kz-header-cell kz-selection-header-cell"
      style={{ height: headerHeight }}
      onClick={handleClick}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        className="kz-selection-checkbox"
        checked={isAllSelected}
        onChange={handleChange}
        onClick={handleClick}
      />
    </div>
  );
}
