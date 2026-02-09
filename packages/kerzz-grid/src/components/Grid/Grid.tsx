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
import { themeToCssVars } from '../../utils/themeUtils';
import { GridHeader } from './GridHeader';
import { GridBody } from './GridBody';
import { GridFooter } from './GridFooter';
import { ActiveFilterBar } from '../Footer/ActiveFilterBar';
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
    toolbar,
    selectionMode = 'single',
    selectionCheckbox,
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    columns,
    getRowId,
    onCellValueChange,
    onEditSave,
    onEditCancel,
    createEmptyRow,
    onNewRowSave,
    onPendingCellChange,
    context,
  } = props;

  const locale = useLocale();
  const [pendingNewRows, setPendingNewRows] = useState<TData[]>([]);
  const grid = useGridInstance(props, pendingNewRows.length);
  const pendingRowIdSet = useMemo(() => {
    if (!getRowId || pendingNewRows.length === 0) return new Set<string>();
    const ids = pendingNewRows
      .map((row) => getRowId(row))
      .filter((id) => id && id.length > 0);
    return new Set(ids);
  }, [pendingNewRows, getRowId]);

  // Merge filtered data with pending new rows for display & editing
  const displayData = useMemo(() => {
    if (pendingNewRows.length === 0) return grid.filteredData;
    return [...grid.filteredData, ...pendingNewRows];
  }, [grid.filteredData, pendingNewRows]);

  const showSelectionCheckbox = useMemo(() => {
    if (selectionMode === 'none') return false;
    // single modunda checkbox gösterme (satıra tıklama ile seçim yapılır)
    if (selectionMode === 'single') return selectionCheckbox ?? false;
    return selectionCheckbox ?? true;
  }, [selectionMode, selectionCheckbox]);

  const rowIdMap = useMemo(() => {
    if (getRowId) return null;
    const map = new Map<TData, string>();
    displayData.forEach((row, index) => {
      map.set(row, String(index));
    });
    return map;
  }, [displayData, getRowId]);

  const getRowIdFn = useCallback(
    (row: TData) => {
      if (getRowId) return getRowId(row);
      const mapped = rowIdMap?.get(row);
      if (mapped !== undefined) return mapped;
      const fallbackIndex = displayData.indexOf(row);
      return fallbackIndex >= 0 ? String(fallbackIndex) : '';
    },
    [getRowId, rowIdMap, displayData],
  );

  const getRowIdForBody = useCallback(
    (row: TData, index: number) => {
      if (getRowId) return getRowId(row);
      return String(index);
    },
    [getRowId],
  );

  const selection = useRowSelection<TData>({
    data: displayData,
    getRowId: getRowIdFn,
    mode: selectionMode,
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
  });

  const handleToggleAll = useCallback(() => {
    if (selection.isAllSelected) {
      selection.deselectAll();
      return;
    }
    selection.selectAll();
  }, [selection.isAllSelected, selection.deselectAll, selection.selectAll]);

  const editing = useGridEditing<TData>({
    columns: grid.orderedColumns as GridColumnDef<TData>[],
    data: displayData,
    onCellValueChange,
    onEditSave,
    createEmptyRow,
    onNewRowSave,
    onPendingCellChange,
    pendingNewRows,
    setPendingNewRows,
    pendingRowIdSet,
    getRowId,
  });
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const footerWrapperRef = useRef<HTMLDivElement>(null);

  // Wrap cancelAllChanges to also notify parent
  const handleCancelAll = useCallback(() => {
    editing.cancelAllChanges();
    onEditCancel?.();
  }, [editing.cancelAllChanges, onEditCancel]);

  // Resolve toolbar config
  const toolbarConfig = useMemo<ToolbarConfig<TData> | null>(() => {
    if (!toolbar) return null;
    if (toolbar === true) return {};
    return toolbar;
  }, [toolbar]);

  const showToolbar = toolbarConfig !== null;

  // Sync horizontal scroll: body -> header & footer
  // hasData dependency ensures the effect re-runs when body mounts/unmounts
  const hasData = displayData.length > 0;

  useEffect(() => {
    const scrollEl = grid.scrollContainerRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const sl = scrollEl.scrollLeft;
      if (headerWrapperRef.current) {
        headerWrapperRef.current.scrollLeft = sl;
      }
      if (footerWrapperRef.current) {
        footerWrapperRef.current.scrollLeft = sl;
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', handleScroll);
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
    selectAll: () => selection.selectAll(),
    deselectAll: () => selection.deselectAll(),
    addRow: () => editing.requestAddRow(),
  }), [grid, editing, selection]);

  // Convert theme to CSS vars
  const cssVars = useMemo(() => themeToCssVars(grid.theme), [grid.theme]);

  const gridStyle: React.CSSProperties = {
    ...cssVars,
    height,
    width,
  };

  const handleFilterApply = useCallback(
    (columnId: string, filter: ActiveFilter) => {
      grid.setFilter(columnId, filter);
    },
    [grid.setFilter],
  );

  const handleFilterClear = useCallback(
    (columnId: string) => {
      grid.removeFilter(columnId);
    },
    [grid.removeFilter],
  );

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
          editMode={editing.editMode}
          onSaveAll={editing.saveAllChanges}
          onCancelAll={handleCancelAll}
          onAddRow={createEmptyRow ? editing.requestAddRow : undefined}
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
          showSelectionCheckbox={showSelectionCheckbox}
          enableSelectAll={selectionMode === 'multiple'}
          isAllSelected={selection.isAllSelected}
          isIndeterminate={selection.isIndeterminate}
          onToggleAll={handleToggleAll}
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
        />
      </div>

      {/* Body */}
      {displayData.length > 0 ? (
        <GridBody
          data={displayData}
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
          selectionMode={selectionMode}
          isRowSelected={selection.isSelected}
          getRowId={getRowIdForBody}
          onSelectionToggle={selection.toggleRow}
          isEditing={editing.isEditing}
          editMode={editing.editMode}
          hasPendingChange={editing.hasPendingChange}
          getPendingValue={editing.getPendingValue}
          onStartEditing={editing.startEditing}
          onSaveEdit={editing.saveValue}
          onCancelEdit={editing.stopEditing}
          onSaveAndMoveNext={editing.saveAndMoveNext}
          context={context}
          pendingRowIdSet={pendingRowIdSet}
          getRowIdFn={getRowId}
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

      {/* Active Filter Bar */}
      {grid.hasActiveFilters && (
        <ActiveFilterBar
          filters={grid.filters}
          disabledFilters={grid.disabledFilters}
          columns={columns as GridColumnDef<TData>[]}
          locale={locale}
          onToggleFilter={grid.toggleFilterEnabled}
          onRemoveFilter={grid.removeFilter}
          onClearAll={grid.clearAllFilters}
        />
      )}

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
