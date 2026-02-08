import React, { useState, useCallback, useRef, useMemo } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ActiveFilter, ActiveDropdownFilter, ActiveInputFilter, ActiveDateTreeFilter, DropdownFilterConfig, InputFilterConfig, DateTreeFilterConfig } from '../../types/filter.types';
import type { SortingState } from '@tanstack/react-table';
import { SortIndicator } from './SortIndicator';
import { ResizeHandle } from './ResizeHandle';
import { FilterDropdown } from '../Filter/FilterDropdown';
import { FilterInput } from '../Filter/FilterInput';
import { FilterDateTree } from '../Filter/FilterDateTree';
import { Portal } from '../Portal/Portal';
import { usePopoverPosition } from '../../core/usePopoverPosition';
import { useGridTheme } from '../../theme/ThemeProvider';
import { themeToCssVars } from '../../utils/themeUtils';

interface HeaderCellProps<TData> {
  column: GridColumnDef<TData>;
  width: number;
  sorting: SortingState;
  activeFilter?: ActiveFilter;
  data: TData[];
  onSort: (columnId: string) => void;
  onResizeStart: (columnId: string, e: React.MouseEvent | React.TouchEvent) => void;
  onFilterApply: (columnId: string, filter: ActiveFilter) => void;
  onFilterClear: (columnId: string) => void;
  // Drag props
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (columnId: string, e: React.DragEvent) => void;
  onDragOver: (columnId: string, e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (columnId: string, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function HeaderCellInner<TData>({
  column,
  width,
  sorting,
  activeFilter,
  data,
  onSort,
  onResizeStart,
  onFilterApply,
  onFilterClear,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: HeaderCellProps<TData>) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const theme = useGridTheme();
  const cssVars = useMemo(() => themeToCssVars(theme), [theme]);

  const { popoverRef, position } = usePopoverPosition(filterOpen, {
    align: 'bottom-left',
  });

  // Sync trigger ref to the filter button
  const setFilterBtnRef = useCallback((el: HTMLButtonElement | null) => {
    (filterBtnRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
  }, []);

  const sortDirection = (() => {
    const sort = sorting.find((s) => s.id === column.id);
    if (!sort) return null;
    return sort.desc ? 'desc' : 'asc';
  })();

  const handleLabelClick = useCallback(() => {
    if (column.sortable !== false) {
      onSort(column.id);
    }
  }, [column.id, column.sortable, onSort]);

  const handleFilterToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterOpen((prev) => !prev);
  }, []);

  const handleFilterApply = useCallback(
    (filter: ActiveFilter) => {
      onFilterApply(column.id, filter);
    },
    [column.id, onFilterApply],
  );

  const handleFilterClear = useCallback(() => {
    onFilterClear(column.id);
  }, [column.id, onFilterClear]);

  // Calculate position from filter button
  const getPopoverPosition = useCallback(() => {
    if (!filterBtnRef.current) return position;
    const rect = filterBtnRef.current.getBoundingClientRect();
    return { top: rect.bottom + 2, left: rect.left };
  }, [position]);

  const hasFilter = !!column.filter;
  const isFilterActive = !!activeFilter;

  const classNames = [
    'kz-header-cell',
    column.sortable !== false && 'kz-header-cell--sortable',
    isDragging && 'kz-header-cell--dragging',
    isDragOver && 'kz-header-cell--drag-over',
    column.headerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const popoverPos = filterOpen ? getPopoverPosition() : { top: 0, left: 0 };

  return (
    <div
      className={classNames}
      style={{ width, minWidth: column.minWidth ?? 50 }}
      draggable={column.draggable !== false}
      onDragStart={(e) => onDragStart(column.id, e)}
      onDragOver={(e) => onDragOver(column.id, e)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(column.id, e)}
      onDragEnd={onDragEnd}
    >
      {/* Label - sort is triggered only when clicking the label */}
      <span className="kz-header-cell__label" onClick={handleLabelClick}>
        {column.headerCell ? column.headerCell(column) : column.header}
      </span>

      {/* Actions */}
      <span className="kz-header-cell__actions">
        {sortDirection && <SortIndicator direction={sortDirection} />}

        {hasFilter && (
          <button
            ref={setFilterBtnRef}
            type="button"
            className={`kz-filter-trigger ${isFilterActive ? 'kz-filter-trigger--active' : ''}`}
            onClick={handleFilterToggle}
            title="Filter"
          >
            <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M1 2C1 1.44772 1.44772 1 2 1H12C12.5523 1 13 1.44772 13 2V3.17157C13 3.43679 12.8946 3.69114 12.7071 3.87868L9.29289 7.29289C9.10536 7.48043 9 7.73478 9 8V10.382C9 10.7607 8.786 11.107 8.44721 11.2764L6.44721 12.2764C5.78231 12.6088 5 12.1253 5 11.382V8C5 7.73478 4.89464 7.48043 4.70711 7.29289L1.29289 3.87868C1.10536 3.69114 1 3.43679 1 3.17157V2Z" />
            </svg>
          </button>
        )}
      </span>

      {/* Resize handle */}
      {column.resizable !== false && (
        <ResizeHandle columnId={column.id} onResizeStart={onResizeStart} />
      )}

      {/* Filter panel - rendered via Portal */}
      {filterOpen && column.filter?.type === 'dropdown' && (
        <Portal>
          <div
            ref={popoverRef}
            className="kz-grid"
            style={{
              ...cssVars,
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 99999,
              border: 'none',
              background: 'transparent',
            }}
          >
            <FilterDropdown
              column={column}
              data={data}
              filterConfig={column.filter as DropdownFilterConfig}
              activeFilter={activeFilter?.type === 'dropdown' ? activeFilter as ActiveDropdownFilter : undefined}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </Portal>
      )}

      {filterOpen && column.filter?.type === 'input' && (
        <Portal>
          <div
            ref={popoverRef}
            className="kz-grid"
            style={{
              ...cssVars,
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 99999,
              border: 'none',
              background: 'transparent',
            }}
          >
            <FilterInput
              filterConfig={column.filter as InputFilterConfig}
              activeFilter={activeFilter?.type === 'input' ? activeFilter as ActiveInputFilter : undefined}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </Portal>
      )}

      {filterOpen && column.filter?.type === 'dateTree' && (
        <Portal>
          <div
            ref={popoverRef}
            className="kz-grid"
            style={{
              ...cssVars,
              position: 'fixed',
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 99999,
              border: 'none',
              background: 'transparent',
            }}
          >
            <FilterDateTree
              column={column}
              data={data}
              filterConfig={column.filter as DateTreeFilterConfig}
              activeFilter={activeFilter?.type === 'dateTree' ? activeFilter as ActiveDateTreeFilter : undefined}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </Portal>
      )}
    </div>
  );
}

export const HeaderCell = React.memo(HeaderCellInner) as typeof HeaderCellInner;
