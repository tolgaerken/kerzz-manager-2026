import React from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { FooterAggregateResult } from '../../types/footer.types';
import { FooterCell } from '../Footer/FooterCell';
import { SelectionFooterCell } from '../Selection/SelectionFooterCell';

interface GridFooterProps<TData> {
  columns: GridColumnDef<TData>[];
  aggregation: Map<string, FooterAggregateResult>;
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  totalWidth: number;
  /** Whether selection checkbox column is shown */
  showSelectionCheckbox?: boolean;
}

export function GridFooter<TData>({
  columns,
  aggregation,
  getColumnWidth,
  totalWidth,
  showSelectionCheckbox,
}: GridFooterProps<TData>) {
  const hasFooter = columns.some((c) => c.footer);
  if (!hasFooter) return null;

  return (
    <div className="kz-grid-footer" style={{ minWidth: totalWidth }}>
      {showSelectionCheckbox && <SelectionFooterCell />}
      {columns.map((col) => (
        <FooterCell
          key={col.id}
          width={getColumnWidth(col.id, col.width ?? 150)}
          align={col.align}
          result={aggregation.get(col.id)}
        />
      ))}
    </div>
  );
}
