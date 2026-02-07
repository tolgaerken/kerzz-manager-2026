import React from 'react';
import type { FooterAggregateResult } from '../../types/footer.types';
import { useLocale } from '../../i18n/useLocale';
import { getAggregateLabel } from '../../utils/aggregation';

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
  const locale = useLocale();

  const alignClass = align ? `kz-footer-cell--align-${align}` : '';

  if (!result) {
    return <div className={`kz-footer-cell ${alignClass}`.trim()} style={{ width }} />;
  }

  const label =
    result.label ?? getAggregateLabel(result.aggregate, locale as unknown as Record<string, string>);

  return (
    <div className={`kz-footer-cell ${alignClass}`.trim()} style={{ width }}>
      {label && <span className="kz-footer-cell__label">{label}:</span>}
      <span className="kz-footer-cell__value">{result.formattedValue}</span>
    </div>
  );
});
