import React, { useMemo, forwardRef, useImperativeHandle, useState, useRef, useCallback, useEffect } from 'react';
import type { GridProps, GridRef } from '../../types/grid.types';
import type { ActiveFilter } from '../../types/filter.types';
import type { ToolbarConfig } from '../../types/toolbar.types';
import type { GridColumnDef } from '../../types/column.types';
import { useGridInstance } from '../../core/useGridInstance';
import { useRowSelection } from '../../core/useRowSelection';
import { useGridEditing } from '../../core/useGridEditing';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { LocaleProvider } from '../../i18n/LocaleProvider';
import { themeToCssVars } from '../../utils/memoize';
import { GridHeader } from './GridHeader';
import { GridBody } from './GridBody';
import { GridFooter } from './GridFooter';
import { GridToolbar } from '../Toolbar/GridToolbar';
import { ColumnVisibilityPanel } from '../ColumnManager/ColumnVisibilityPanel';
import { Portal } from '../Portal/Portal';
import { useLocale } from '../../i18n/useLocale';
import '../../theme/grid-base.css';

function GridInner<TData>(
  props: GridProps<TData>,
  ref: React.ForwardedRef<GridRef>,
) {
  const {
    height = 500,
    width = '100%',
    loading = false,
    stripedRows = false,
    toolbar = true,
    onRowClick,
    onRowDoubleClick,
    columns,
    // Selection props
    selectionMode = 'none',
    selectionCheckbox,
    selectedIds: controlledSelectedIds,
    defaultSelectedIds,
    onSelectionChange,
    getRowId,
    // Editing props
    context,
    onCellValueChange,
  } = props;

  const locale = useLocale();
  const grid = useGridInstance(props);
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const footerWrapperRef = useRef<HTMLDivElement>(null);

  // Default getRowId uses index
  const resolveRowId = useCallback(
    (row: TData, index: number) => {
      if (getRowId) return getRowId(row);
      return String(index);
    },
    [getRowId]
  );

  // Selection state
  const showSelectionCheckbox = selectionMode !== 'none' && (selectionCheckbox ?? true);

  // Create a stable getRowId function for selection
  const selectionGetRowId = useCallback(
    (row: TData) => {
      if (getRowId) return getRowId(row);
      // Fallback: use index from filteredData
      const index = grid.filteredData.indexOf(row);
      return String(index);
    },
    [getRowId, grid.filteredData]
  );
  
  const selection = useRowSelection({
    data: grid.filteredData,
    getRowId: selectionGetRowId,
    mode: selectionMode,
    selectedIds: controlledSelectedIds,
    defaultSelectedIds,
    onSelectionChange,
  });

  // Editing state
  const editing = useGridEditing({
    columns: grid.orderedColumns as GridColumnDef<TData>[],
    data: grid.filteredData,
    onCellValueChange,
  });

  // Toggle select all handler
  const handleToggleSelectAll = useCallback(() => {
    if (selection.isAllSelected) {
      selection.deselectAll();
    } else {
      selection.selectAll();
    }
  }, [selection]);

  // Resolve toolbar config
  const toolbarConfig = useMemo<ToolbarConfig<TData> | null>(() => {
    if (!toolbar) return null;
    if (toolbar === true) return {};
    return toolbar;
  }, [toolbar]);

  const showToolbar = toolbarConfig !== null;

  // Sync horizontal scroll: body -> header & footer
  // hasData dependency ensures the effect re-runs when body mounts/unmounts
  const hasData = grid.filteredData.length > 0;

  useEffect(() => {
    const scrollEl = grid.scrollContainerRef.current;
    const header = headerWrapperRef.current;
    const footer = footerWrapperRef.current;
    if (!scrollEl) return;

    // ---- Scrollbar width compensation ----
    // Body has a vertical scrollbar that reduces its clientWidth.
    // Header/footer don't. Adding marginRight to header/footer makes them
    // the same width as the body's content area, so columns always align.
    const syncScrollbarGap = () => {
      const sbw = scrollEl.offsetWidth - scrollEl.clientWidth;
      const margin = `${sbw}px`;
      if (header) header.style.marginRight = margin;
      if (footer) footer.style.marginRight = margin;
    };

    syncScrollbarGap();
    const ro = new ResizeObserver(syncScrollbarGap);
    ro.observe(scrollEl);

    // ---- Horizontal scroll sync ----
    const syncScroll = () => {
      const sl = scrollEl.scrollLeft;
      if (header) header.scrollLeft = sl;
      if (footer) footer.scrollLeft = sl;
    };

    syncScroll();
    scrollEl.addEventListener('scroll', syncScroll, { passive: true });

    // ---- Redirect wheel on header/footer to body ----
    const redirectWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) {
        e.preventDefault();
        scrollEl.scrollLeft += e.deltaX;
      }
    };

    header?.addEventListener('wheel', redirectWheel, { passive: false });
    footer?.addEventListener('wheel', redirectWheel, { passive: false });

    return () => {
      ro.disconnect();
      scrollEl.removeEventListener('scroll', syncScroll);
      header?.removeEventListener('wheel', redirectWheel);
      footer?.removeEventListener('wheel', redirectWheel);
    };
  }, [grid.scrollContainerRef, hasData]);

  // Expose imperative API
  useImperativeHandle(ref, () => ({
    resetFilters: grid.clearAllFilters,
    resetSorting: () => grid.handleSort(''),
    resetState: grid.resetState,
    getState: () => grid.state,
    scrollToRow: (index: number) => {
      grid.rowVirtualizer.scrollToIndex(index, { align: 'center' });
    },
    getSelectedIds: () => Array.from(selection.selectedIds),
    selectAll: selection.selectAll,
    deselectAll: selection.deselectAll,
  }), [grid, selection]);

  // Convert theme to CSS vars
  const cssVars = useMemo(() => themeToCssVars(grid.theme), [grid.theme]);

  const gridStyle: React.CSSProperties = {
    ...cssVars,
    height,
    width,
  };

  const handleFilterApply = (columnId: string, filter: ActiveFilter) => {
    grid.setFilter(columnId, filter);
  };

  const handleFilterClear = (columnId: string) => {
    grid.removeFilter(columnId);
  };

  // Calculate column panel position from button (for non-toolbar mode)
  const getColPanelPos = useCallback(() => {
    if (!colBtnRef.current) return { top: 0, left: 0 };
    const rect = colBtnRef.current.getBoundingClientRect();
    const panelWidth = 220;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    return { top: rect.bottom + 4, left };
  }, []);

  const colPanelPos = columnPanelOpen ? getColPanelPos() : { top: 0, left: 0 };

  return (
    <div className="kz-grid" style={gridStyle}>
      {/* Toolbar */}
      {showToolbar && (
        <GridToolbar
          config={toolbarConfig!}
          data={grid.filteredData}
          columns={grid.orderedColumns as GridColumnDef<TData>[]}
          allColumns={columns as GridColumnDef<TData>[]}
          visibility={grid.state.columnVisibility}
          onToggleColumn={grid.columnVisibility.toggleColumn}
          onShowAll={grid.columnVisibility.showAllColumns}
          onHideAll={grid.columnVisibility.hideAllColumns}
          cssVars={cssVars}
          searchTerm={grid.searchTerm}
          onSearchChange={grid.setSearchTerm}
        />
      )}

      {/* Column visibility toggle button (only when toolbar is NOT active) */}
      {!showToolbar && (
        <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 10 }}>
          <button
            ref={colBtnRef}
            type="button"
            className="kz-filter-trigger"
            onClick={() => setColumnPanelOpen((p) => !p)}
            title={locale.columnVisibility}
            style={{ width: 24, height: 24 }}
          >
            <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <rect x="1" y="2" width="5" height="2" rx="0.5" />
              <rect x="1" y="6" width="5" height="2" rx="0.5" />
              <rect x="1" y="10" width="5" height="2" rx="0.5" />
              <rect x="8" y="2" width="5" height="2" rx="0.5" />
              <rect x="8" y="6" width="5" height="2" rx="0.5" />
              <rect x="8" y="10" width="5" height="2" rx="0.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Column visibility panel (only when toolbar is NOT active) */}
      {!showToolbar && columnPanelOpen && (
        <Portal>
          <div
            className="kz-grid"
            style={{
              ...cssVars,
              position: 'fixed',
              top: colPanelPos.top,
              left: colPanelPos.left,
              zIndex: 99999,
              border: 'none',
              background: 'transparent',
            }}
          >
            <ColumnVisibilityPanel
              columns={columns as GridColumnDef[]}
              visibility={grid.state.columnVisibility}
              onToggle={grid.columnVisibility.toggleColumn}
              onShowAll={grid.columnVisibility.showAllColumns}
              onHideAll={grid.columnVisibility.hideAllColumns}
              onClose={() => setColumnPanelOpen(false)}
            />
          </div>
        </Portal>
      )}

      {/* Header */}
      <div className="kz-grid-header-wrapper" ref={headerWrapperRef}>
        <GridHeader
          columns={grid.orderedColumns}
          filterData={grid.originalData}
          sorting={grid.sorting}
          filters={grid.filters}
          getColumnWidth={grid.columnResize.getColumnWidth}
          totalWidth={grid.totalWidth}
          onSort={grid.handleSort}
          onResizeStart={grid.columnResize.handleResizeStart}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          dragColumnId={grid.columnDrag.dragColumnId}
          dropTargetId={grid.columnDrag.dropTargetId}
          onDragStart={grid.columnDrag.handleDragStart}
          onDragOver={grid.columnDrag.handleDragOver}
          onDragLeave={grid.columnDrag.handleDragLeave}
          onDrop={grid.columnDrag.handleDrop}
          onDragEnd={grid.columnDrag.handleDragEnd}
          showSelectionCheckbox={showSelectionCheckbox}
          isAllSelected={selection.isAllSelected}
          isIndeterminate={selection.isIndeterminate}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </div>

      {/* Body */}
      {grid.filteredData.length > 0 ? (
        <GridBody
          data={grid.filteredData}
          columns={grid.orderedColumns}
          virtualRows={grid.virtualRows}
          totalHeight={grid.totalHeight}
          totalWidth={grid.totalWidth}
          getColumnWidth={grid.columnResize.getColumnWidth}
          stripedRows={stripedRows}
          scrollContainerRef={grid.scrollContainerRef}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          showSelectionCheckbox={showSelectionCheckbox}
          isRowSelected={selection.isSelected}
          getRowId={(row, index) => resolveRowId(row, index)}
          onSelectionToggle={selection.toggleRow}
          isEditing={editing.isEditing}
          onStartEditing={editing.startEditing}
          onSaveEdit={editing.saveValue}
          onCancelEdit={editing.stopEditing}
          context={context}
        />
      ) : (
        <div className="kz-grid-no-data">
          {locale.noData}
        </div>
      )}

      {/* Footer */}
      <div className="kz-grid-footer-wrapper" ref={footerWrapperRef}>
        <GridFooter
          columns={grid.orderedColumns}
          aggregation={grid.footerAggregation}
          getColumnWidth={grid.columnResize.getColumnWidth}
          totalWidth={grid.totalWidth}
          showSelectionCheckbox={showSelectionCheckbox}
        />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="kz-grid-loading">
          <div className="kz-grid-loading__spinner" />
        </div>
      )}
    </div>
  );
}

// ForwardRef wrapper that preserves generic
const GridWithRef = forwardRef(GridInner) as <TData>(
  props: GridProps<TData> & { ref?: React.Ref<GridRef> },
) => React.ReactElement | null;

/**
 * Main Grid component. Wraps data with theme and locale providers.
 */
export function Grid<TData>(
  props: GridProps<TData> & { ref?: React.Ref<GridRef> },
) {
  const { theme, locale, ref: forwardedRef, ...rest } = props;

  return (
    <ThemeProvider theme={theme}>
      <LocaleProvider locale={locale}>
        <GridWithRef ref={forwardedRef} {...rest} columns={props.columns} />
      </LocaleProvider>
    </ThemeProvider>
  );
}
