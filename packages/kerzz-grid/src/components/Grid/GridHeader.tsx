import React from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ActiveFilter } from '../../types/filter.types';
import type { SortingState } from '@tanstack/react-table';
import { HeaderCell } from '../HeaderCell/HeaderCell';
import { SelectionHeaderCell } from '../Selection/SelectionHeaderCell';

interface GridHeaderProps<TData> {
  columns: GridColumnDef<TData>[];
  /** Original unfiltered data - used for computing filter unique values */
  filterData: TData[];
  sorting: SortingState;
  filters: Record<string, ActiveFilter>;
  getColumnWidth: (columnId: string, defaultWidth?: number) => number;
  totalWidth: number;
  onSort: (columnId: string) => void;
  onResizeStart: (columnId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onFilterApply: (columnId: string, filter: ActiveFilter) => void;
  onFilterClear: (columnId: string) => void;
  // Drag
  dragColumnId: string | null;
  dropTargetId: string | null;
  onDragStart: (columnId: string, e: React.DragEvent) => void;
  onDragOver: (columnId: string, e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (columnId: string, e: React.DragEvent) => void;
  onDragEnd: () => void;
  // Selection
  /** Whether selection checkbox is shown */
  showSelectionCheckbox?: boolean;
  /** Whether all rows are selected */
  isAllSelected?: boolean;
  /** Whether some (but not all) rows are selected */
  isIndeterminate?: boolean;
  /** Callback when select all is toggled */
  onToggleSelectAll?: () => void;
}

export function GridHeader<TData>({
  columns,
  filterData,
  sorting,
  filters,
  getColumnWidth,
  totalWidth,
  onSort,
  onResizeStart,
  onFilterApply,
  onFilterClear,
  dragColumnId,
  dropTargetId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  showSelectionCheckbox,
  isAllSelected,
  isIndeterminate,
  onToggleSelectAll,
}: GridHeaderProps<TData>) {
  return (
    <div className="kz-grid-header" style={{ minWidth: totalWidth }}>
      {showSelectionCheckbox && (
        <SelectionHeaderCell
          isAllSelected={isAllSelected ?? false}
          isIndeterminate={isIndeterminate ?? false}
          onToggleAll={onToggleSelectAll ?? (() => {})}
        />
      )}
      {columns.map((col) => (
        <HeaderCell
          key={col.id}
          column={col}
          width={getColumnWidth(col.id, col.width ?? 150)}
          sorting={sorting}
          activeFilter={filters[col.id]}
          data={filterData}
          onSort={onSort}
          onResizeStart={onResizeStart}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          isDragging={dragColumnId === col.id}
          isDragOver={dropTargetId === col.id}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}
