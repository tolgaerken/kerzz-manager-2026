import React from 'react';

interface SelectionFooterCellProps {
  /** Footer height for consistent sizing */
  footerHeight?: number;
}

/**
 * Empty selection cell for footer
 * Maintains alignment with header and body selection cells
 * Positioned as sticky on the left side
 */
export function SelectionFooterCell({ footerHeight }: SelectionFooterCellProps) {
  return (
    <div
      className="kz-footer-cell kz-selection-footer-cell"
      style={{ height: footerHeight }}
    />
  );
}
