import React from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { FooterAggregateResult } from '../../types/footer.types';
import { FooterCell } from '../Footer/FooterCell';

interface GridFooterProps<TData> {
  columns: GridColumnDef<TData>[];
  aggregation: Map<string, FooterAggregateResult>;
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  totalWidth: number;
}

export function GridFooter<TData>({
  columns,
  aggregation,
  getColumnWidth,
  totalWidth,
}: GridFooterProps<TData>) {
  const hasFooter = columns.some((c) => c.footer);
  if (!hasFooter) return null;

  return (
    <div className="kz-grid-footer" style={{ minWidth: totalWidth }}>
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
