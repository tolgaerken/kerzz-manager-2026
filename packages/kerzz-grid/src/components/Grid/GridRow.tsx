import React from 'react';
import type { GridColumnDef } from '../../types/column.types';
import { GridCell } from './GridCell';

interface GridRowProps<TData> {
  row: TData;
  rowIndex: number;
  columns: GridColumnDef<TData>[];
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  isStriped: boolean;
  style: React.CSSProperties;
  onClick?: (row: TData, index: number) => void;
  onDoubleClick?: (row: TData, index: number) => void;
}

function GridRowInner<TData>({
  row,
  rowIndex,
  columns,
  getColumnWidth,
  isStriped,
  style,
  onClick,
  onDoubleClick,
}: GridRowProps<TData>) {
  const classNames = [
    'kz-grid-row',
    isStriped && 'kz-grid-row--striped',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={style}
      onClick={() => onClick?.(row, rowIndex)}
      onDoubleClick={() => onDoubleClick?.(row, rowIndex)}
    >
      {columns.map((col) => {
        const value = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

        return (
          <GridCell
            key={col.id}
            column={col}
            row={row}
            width={getColumnWidth(col.id, col.width ?? 150)}
            value={value}
          />
        );
      })}
    </div>
  );
}

export const GridRow = React.memo(GridRowInner) as typeof GridRowInner;
