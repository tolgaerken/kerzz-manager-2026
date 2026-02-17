import React, { useCallback, useMemo } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ColumnWithStickyMeta } from '../../core/useGridInstance';
import type { NavigationDirection } from '../../types/editing.types';
import type { SelectionMode } from '../../types/selection.types';
import { GridCell } from './GridCell';
import { SelectionCell } from '../Selection/SelectionCell';

interface GridRowProps<TData> {
  row: TData;
  rowIndex: number;
  columns: ColumnWithStickyMeta<TData>[];
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  isStriped: boolean;
  style: React.CSSProperties;
  onClick?: (row: TData, index: number) => void;
  onDoubleClick?: (row: TData, index: number) => void;
  /** Whether selection checkbox is shown */
  showSelectionCheckbox?: boolean;
  /** Selection mode */
  selectionMode?: SelectionMode;
  /** Whether this row is selected */
  isSelected?: boolean;
  /** Row ID for selection toggle */
  rowId?: string;
  /** Callback when selection is toggled */
  onSelectionToggle?: (rowId: string, shiftKey: boolean) => void;
  // Editing props
  /** Check if a cell is being edited */
  isEditing?: (rowIndex: number, columnId: string) => boolean;
  /** Whether the grid is in batch edit mode */
  editMode?: boolean;
  /** Check if a cell has a pending change */
  hasPendingChange?: (rowIndex: number, columnId: string) => boolean;
  /** Get pending value for a cell */
  getPendingValue?: (rowIndex: number, columnId: string) => unknown | undefined;
  /** Start editing a cell */
  onStartEditing?: (rowIndex: number, columnId: string) => void;
  /** Save edited value */
  onSaveEdit?: (newValue: unknown) => void;
  /** Cancel editing */
  onCancelEdit?: () => void;
  /** Save value and navigate to next editable cell */
  onSaveAndMoveNext?: (newValue: unknown, direction: NavigationDirection) => void;
  /** External context for editors */
  context?: Record<string, unknown>;
  /** Whether this row is a pending new row (not yet saved) */
  isPendingNewRow?: boolean;
  /** Optional extra CSS class name for the row */
  rowClassName?: string;
}

const NOOP_TOGGLE = () => {};

function GridRowInner<TData>({
  row,
  rowIndex,
  columns,
  getColumnWidth,
  isStriped,
  style,
  onClick,
  onDoubleClick,
  showSelectionCheckbox,
  selectionMode,
  isSelected,
  rowId,
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
  isPendingNewRow,
  rowClassName,
}: GridRowProps<TData>) {
  const hasEditingCell = useMemo(
    () => (isEditing ? columns.some((col) => isEditing(rowIndex, col.id)) : false),
    [isEditing, columns, rowIndex],
  );

  const hasPendingRow = useMemo(
    () => (hasPendingChange ? columns.some((col) => hasPendingChange(rowIndex, col.id)) : false),
    [hasPendingChange, columns, rowIndex],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // single veya multiple modunda satıra tıklandığında seçim toggle et
      if (selectionMode !== 'none' && rowId && onSelectionToggle) {
        onSelectionToggle(rowId, e.shiftKey);
      }
      onClick?.(row, rowIndex);
    },
    [onClick, row, rowIndex, selectionMode, rowId, onSelectionToggle],
  );

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(row, rowIndex);
  }, [onDoubleClick, row, rowIndex]);

  const handleSelectionToggle = useCallback(
    (shiftKey: boolean) => {
      if (rowId && onSelectionToggle) {
        onSelectionToggle(rowId, shiftKey);
      }
    },
    [rowId, onSelectionToggle],
  );

  const classNames = [
    'kz-grid-row',
    isStriped && 'kz-grid-row--striped',
    isSelected && 'kz-grid-row--selected',
    hasEditingCell && 'kz-grid-row--editing',
    hasPendingRow && 'kz-grid-row--changed',
    isPendingNewRow && 'kz-grid-row--pending-new',
    rowClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {showSelectionCheckbox && (
        <SelectionCell
          isSelected={isSelected ?? false}
          onToggle={onSelectionToggle ? handleSelectionToggle : NOOP_TOGGLE}
        />
      )}
      {columns.map((col) => {
        const value = col.accessorFn
          ? col.accessorFn(row)
          : (row as Record<string, unknown>)[col.accessorKey ?? col.id];

        const cellHasPending = hasPendingChange?.(rowIndex, col.id) ?? false;
        const pendingVal = cellHasPending ? getPendingValue?.(rowIndex, col.id) : undefined;

        return (
          <GridCell
            key={col.id}
            column={col}
            row={row}
            rowIndex={rowIndex}
            width={getColumnWidth(col.id, col.width ?? 150)}
            value={value}
            stickyMeta={col.stickyMeta}
            isEditing={isEditing?.(rowIndex, col.id)}
            editMode={editMode}
            pendingValue={pendingVal}
            hasPendingChange={cellHasPending}
            onStartEditing={onStartEditing}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            onSaveAndMoveNext={onSaveAndMoveNext}
            context={context}
          />
        );
      })}
    </div>
  );
}

export const GridRow = React.memo(GridRowInner) as typeof GridRowInner;
