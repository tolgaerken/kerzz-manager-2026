import React from 'react';
import type { GridColumnDef } from '../../types/column.types';

interface GridCellProps<TData> {
  column: GridColumnDef<TData>;
  row: TData;
  width: number;
  value: unknown;
}

function resolveAlign(
  explicitAlign: 'left' | 'center' | 'right' | undefined,
  value: unknown,
): string {
  if (explicitAlign) return explicitAlign;
  if (typeof value === 'number') return 'right';
  return '';
}

function GridCellInner<TData>({
  column,
  row,
  width,
  value,
}: GridCellProps<TData>) {
  const align = resolveAlign(column.align, value);
  const alignClass = align ? `kz-grid-cell--align-${align}` : '';

  const className =
    typeof column.cellClassName === 'function'
      ? column.cellClassName(value, row)
      : column.cellClassName ?? '';

  const content = column.cell
    ? column.cell(value, row)
    : value != null
      ? String(value)
      : '';

  return (
    <div
      className={`kz-grid-cell ${alignClass} ${className}`.trim()}
      style={{ width, minWidth: column.minWidth ?? 50 }}
    >
      <span className="kz-grid-cell__content">{content}</span>
    </div>
  );
}

export const GridCell = React.memo(GridCellInner) as typeof GridCellInner;
