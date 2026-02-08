import React, { useCallback } from 'react';

interface SelectionCellProps {
  /** Whether the row is selected */
  isSelected: boolean;
  /** Callback when checkbox is clicked */
  onToggle: (shiftKey: boolean) => void;
  /** Row height for consistent sizing */
  rowHeight?: number;
}

/**
 * Selection checkbox cell for grid rows
 * Positioned as sticky on the left side
 */
export const SelectionCell = React.memo(function SelectionCell({
  isSelected,
  onToggle,
  rowHeight,
}: SelectionCellProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(e.shiftKey);
    },
    [onToggle],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="kz-grid-cell kz-selection-cell"
      style={{ height: rowHeight }}
      onClick={handleClick}
    >
      <input
        type="checkbox"
        className="kz-selection-checkbox"
        checked={isSelected}
        onChange={handleChange}
        onClick={handleClick}
      />
    </div>
  );
});
