import React from 'react';
import type { VirtualItem } from '@tanstack/react-virtual';
import type { GridColumnDef } from '../../types/column.types';
import { GridRow } from './GridRow';

interface GridBodyProps<TData> {
  data: TData[];
  columns: GridColumnDef<TData>[];
  virtualRows: VirtualItem[];
  totalHeight: number;
  totalWidth: number;
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  stripedRows: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onRowClick?: (row: TData, index: number) => void;
  onRowDoubleClick?: (row: TData, index: number) => void;
}

export function GridBody<TData>({
  data,
  columns,
  virtualRows,
  totalHeight,
  totalWidth,
  getColumnWidth,
  stripedRows,
  scrollContainerRef,
  onRowClick,
  onRowDoubleClick,
}: GridBodyProps<TData>) {
  return (
    <div className="kz-grid-body" ref={scrollContainerRef}>
      <div
        className="kz-grid-body__inner"
        style={{ height: totalHeight, minWidth: totalWidth }}
      >
        {virtualRows.map((virtualRow) => {
          const row = data[virtualRow.index];
          if (!row) return null;

          return (
            <GridRow
              key={virtualRow.index}
              row={row}
              rowIndex={virtualRow.index}
              columns={columns}
              getColumnWidth={getColumnWidth}
              isStriped={stripedRows && virtualRow.index % 2 === 1}
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={onRowClick}
              onDoubleClick={onRowDoubleClick}
            />
          );
        })}
      </div>
    </div>
  );
}
