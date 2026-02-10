import React from 'react';
import type { FooterAggregateResult } from '../../types/footer.types';

interface FooterCellProps {
  width: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  result?: FooterAggregateResult;
}

export function FooterCell({
  width,
  minWidth,
  align,
  result,
}: FooterCellProps) {
  const alignClass = align ? `kz-footer-cell--align-${align}` : '';
  const style = {
    width,
    minWidth: minWidth ?? 50,
    maxWidth: width,
    flexBasis: width,
    flexGrow: 0,
    flexShrink: 0,
  };

  if (!result) {
    return <div className={`kz-footer-cell ${alignClass}`.trim()} style={style} />;
  }

  // Label only shown if explicitly provided in footer config
  const label = result.label;

  return (
    <div className={`kz-footer-cell ${alignClass}`.trim()} style={style}>
      {label && <span className="kz-footer-cell__label">{label}:</span>}
      <span className="kz-footer-cell__value">{result.formattedValue}</span>
    </div>
  );
}
