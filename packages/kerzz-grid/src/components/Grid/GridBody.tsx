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
  /** Whether selection checkbox is shown */
  showSelectionCheckbox?: boolean;
  /** Function to check if a row is selected */
  isRowSelected?: (rowId: string) => boolean;
  /** Function to get row ID */
  getRowId?: (row: TData, index: number) => string;
  /** Callback when selection is toggled */
  onSelectionToggle?: (rowId: string, shiftKey: boolean) => void;
  // Editing props
  isEditing?: (rowIndex: number, columnId: string) => boolean;
  onStartEditing?: (rowIndex: number, columnId: string) => void;
  onSaveEdit?: (newValue: unknown) => void;
  onCancelEdit?: () => void;
  context?: Record<string, unknown>;
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
  showSelectionCheckbox,
  isRowSelected,
  getRowId,
  onSelectionToggle,
  isEditing,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  context,
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

          const rowId = getRowId ? getRowId(row, virtualRow.index) : String(virtualRow.index);
          const isSelected = isRowSelected?.(rowId) ?? false;

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
              showSelectionCheckbox={showSelectionCheckbox}
              isSelected={isSelected}
              onSelectionToggle={(shiftKey) => onSelectionToggle?.(rowId, shiftKey)}
              isEditing={isEditing}
              onStartEditing={onStartEditing}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              context={context}
            />
          );
        })}
      </div>
    </div>
  );
}
