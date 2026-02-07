import React from 'react';
import type { FooterAggregateResult } from '../../types/footer.types';

interface FooterCellProps {
  width: number;
  align?: 'left' | 'center' | 'right';
  result?: FooterAggregateResult;
}

export const FooterCell = React.memo(function FooterCell({
  width,
  align,
  result,
}: FooterCellProps) {
  const alignClass = align ? `kz-footer-cell--align-${align}` : '';

  if (!result) {
    return <div className={`kz-footer-cell ${alignClass}`.trim()} style={{ width }} />;
  }

  // Label only shown if explicitly provided in footer config
  const label = result.label;

  return (
    <div className={`kz-footer-cell ${alignClass}`.trim()} style={{ width }}>
      {label && <span className="kz-footer-cell__label">{label}:</span>}
      <span className="kz-footer-cell__value">{result.formattedValue}</span>
    </div>
  );
});
