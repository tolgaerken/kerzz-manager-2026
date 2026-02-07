import React from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { NavigationDirection } from '../../types/editing.types';
import { GridCell } from './GridCell';
import { SelectionCell } from '../Selection/SelectionCell';

interface GridRowProps<TData> {
  row: TData;
  rowIndex: number;
  columns: GridColumnDef<TData>[];
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  isStriped: boolean;
  style: React.CSSProperties;
  onClick?: (row: TData, index: number) => void;
  onDoubleClick?: (row: TData, index: number) => void;
  /** Whether selection checkbox is shown */
  showSelectionCheckbox?: boolean;
  /** Whether this row is selected */
  isSelected?: boolean;
  /** Callback when selection is toggled */
  onSelectionToggle?: (shiftKey: boolean) => void;
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
  showSelectionCheckbox,
  isSelected,
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
}: GridRowProps<TData>) {
  const hasEditingCell = isEditing
    ? columns.some((col) => isEditing(rowIndex, col.id))
    : false;

  const hasPendingRow = hasPendingChange
    ? columns.some((col) => hasPendingChange(rowIndex, col.id))
    : false;

  const classNames = [
    'kz-grid-row',
    isStriped && 'kz-grid-row--striped',
    isSelected && 'kz-grid-row--selected',
    hasEditingCell && 'kz-grid-row--editing',
    hasPendingRow && 'kz-grid-row--changed',
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
      {showSelectionCheckbox && (
        <SelectionCell
          isSelected={isSelected ?? false}
          onToggle={onSelectionToggle ?? (() => {})}
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
