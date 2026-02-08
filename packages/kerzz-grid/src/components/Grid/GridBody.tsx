import React, { useCallback } from 'react';
import type { VirtualItem } from '@tanstack/react-virtual';
import type { GridColumnDef } from '../../types/column.types';
import type { NavigationDirection } from '../../types/editing.types';
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
  /** Whether the grid is in batch edit mode */
  editMode?: boolean;
  /** Check if a cell has a pending change */
  hasPendingChange?: (rowIndex: number, columnId: string) => boolean;
  /** Get pending value for a cell */
  getPendingValue?: (rowIndex: number, columnId: string) => unknown | undefined;
  onStartEditing?: (rowIndex: number, columnId: string) => void;
  onSaveEdit?: (newValue: unknown) => void;
  onCancelEdit?: () => void;
  /** Save value and navigate to next editable cell */
  onSaveAndMoveNext?: (newValue: unknown, direction: NavigationDirection) => void;
  context?: Record<string, unknown>;
  /** Set of pending new row IDs */
  pendingRowIdSet?: Set<string>;
  /** Function to get row ID from row data */
  getRowIdFn?: (row: TData) => string;
}

function GridBodyInner<TData>({
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
  editMode,
  hasPendingChange,
  getPendingValue,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onSaveAndMoveNext,
  context,
  pendingRowIdSet,
  getRowIdFn,
}: GridBodyProps<TData>) {
  const handleSelectionToggle = useCallback(
    (rowId: string, shiftKey: boolean) => {
      onSelectionToggle?.(rowId, shiftKey);
    },
    [onSelectionToggle],
  );

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
          const isPendingNew = !!(pendingRowIdSet && pendingRowIdSet.size > 0 && getRowIdFn && pendingRowIdSet.has(getRowIdFn(row)));

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
              rowId={rowId}
              onSelectionToggle={handleSelectionToggle}
              isEditing={isEditing}
              editMode={editMode}
              hasPendingChange={hasPendingChange}
              getPendingValue={getPendingValue}
              onStartEditing={onStartEditing}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onSaveAndMoveNext={onSaveAndMoveNext}
              context={context}
              isPendingNewRow={isPendingNew}
            />
          );
        })}
      </div>
    </div>
  );
}

export const GridBody = React.memo(GridBodyInner) as typeof GridBodyInner;
