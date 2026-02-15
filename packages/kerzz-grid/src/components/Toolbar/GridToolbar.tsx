import React, { useCallback, useRef, useState } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ToolbarConfig, ToolbarButtonConfig } from '../../types/toolbar.types';
import type { GridSettings, FooterAggregationSetting } from '../../types/settings.types';
import type { SelectionMode } from '../../types/selection.types';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarSeparator } from './ToolbarSeparator';
import { ToolbarSearchInput } from './ToolbarSearchInput';
import { ExcelIcon, PdfIcon, ColumnsIcon, SaveIcon, CancelIcon, AddRowIcon, SettingsIcon } from './ToolbarIcons';
import { ColumnVisibilityPanel } from '../ColumnManager/ColumnVisibilityPanel';
import { GridSettingsPanel } from '../Settings/GridSettingsPanel';
import { Portal } from '../Portal/Portal';
import { useLocale } from '../../i18n/useLocale';
import { exportToXlsx } from '../../utils/exportXlsx';
import { exportToPrint } from '../../utils/exportPrint';

interface GridToolbarProps<TData> {
  config: ToolbarConfig<TData>;
  data: TData[];
  columns: GridColumnDef<TData>[];
  allColumns: GridColumnDef<TData>[];
  visibility: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  onShowAll: (ids: string[]) => void;
  onHideAll: (ids: string[]) => void;
  cssVars: React.CSSProperties;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  /** Whether the grid is in batch edit mode */
  editMode?: boolean;
  /** Commit all pending changes */
  onSaveAll?: () => void;
  /** Discard all pending changes */
  onCancelAll?: () => void;
  /** Add a new row (always visible when provided and showAddRow is not false) */
  onAddRow?: () => void;
  /** Current grid settings */
  settings?: GridSettings;
  /** Called when selection mode changes */
  onSelectionModeChange?: (mode: SelectionMode) => void;
  /** Called when header filter visibility changes */
  onHeaderFilterChange?: (columnId: string, enabled: boolean) => void;
  /** Called when footer aggregation changes */
  onFooterAggregationChange?: (columnId: string, aggregation: FooterAggregationSetting) => void;
  /** Called when striped rows setting changes */
  onStripedRowsChange?: (enabled: boolean) => void;
  /** Called when reset sorting is clicked */
  onResetSorting?: () => void;
  /** Called when reset all is clicked */
  onResetAll?: () => void;
  /** Number of currently selected rows */
  selectedCount?: number;
  /** Called when the selected count indicator is clicked (scroll to first selected) */
  onSelectedCountClick?: () => void;
}

function GridToolbarInner<TData>({
  config,
  data,
  columns,
  allColumns,
  visibility,
  onToggleColumn,
  onShowAll,
  onHideAll,
  cssVars,
  searchTerm,
  onSearchChange,
  editMode,
  onSaveAll,
  onCancelAll,
  onAddRow,
  settings,
  onSelectionModeChange,
  onHeaderFilterChange,
  onFooterAggregationChange,
  onStripedRowsChange,
  onResetSorting,
  onResetAll,
  selectedCount = 0,
  onSelectedCountClick,
}: GridToolbarProps<TData>) {
  const locale = useLocale();
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  const showSearch = config.showSearch !== false;
  const showExcel = config.showExcelExport !== false;
  const showPdf = config.showPdfExport !== false;
  const showColumns = config.showColumnVisibility !== false;
  const showSettings = config.showSettings !== false && settings != null;
  const showAddRow = config.showAddRow !== false;
  const customButtons = config.customButtons ?? [];
  const fileName = config.exportFileName ?? 'grid-export';

  const handleExcelExport = useCallback(() => {
    if (config.onExportExcel) {
      config.onExportExcel(data, columns);
    } else {
      exportToXlsx(data, columns, fileName);
    }
  }, [data, columns, config, fileName]);

  const handlePdfExport = useCallback(() => {
    if (config.onExportPdf) {
      config.onExportPdf(data, columns);
    } else {
      exportToPrint(data, columns, fileName);
    }
  }, [data, columns, config, fileName]);

  const handleColumnToggle = useCallback(() => {
    setColumnPanelOpen((prev) => !prev);
  }, []);

  const getColPanelPos = useCallback(() => {
    if (!colBtnRef.current) return { top: 0, left: 0 };
    const rect = colBtnRef.current.getBoundingClientRect();
    const panelWidth = 220;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    return { top: rect.bottom + 4, left };
  }, []);

  const colPanelPos = columnPanelOpen ? getColPanelPos() : { top: 0, left: 0 };

  const getSettingsPanelPos = useCallback(() => {
    if (!settingsBtnRef.current) return { top: 0, left: 0 };
    const rect = settingsBtnRef.current.getBoundingClientRect();
    const panelWidth = 300;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    return { top: rect.bottom + 4, left };
  }, []);

  const settingsPanelPos = settingsPanelOpen ? getSettingsPanelPos() : { top: 0, left: 0 };

  const handleSettingsToggle = useCallback(() => {
    setSettingsPanelOpen((prev) => !prev);
  }, []);

  const hasCustomButtons = customButtons.length > 0;

  // Row count badge: shows "selected / total" or just "total"
  const rowCountBadge = (
    <button
      type="button"
      className={[
        'kz-toolbar__row-count',
        selectedCount > 0 && onSelectedCountClick ? 'kz-toolbar__row-count--clickable' : '',
      ].filter(Boolean).join(' ')}
      onClick={selectedCount > 0 ? (onSelectedCountClick ?? undefined) : undefined}
      title={
        selectedCount > 0
          ? `${locale.toolbarSelectedRows}: ${selectedCount} / ${data.length}`
          : String(data.length)
      }
    >
      {selectedCount > 0 ? (
        <><span className="kz-toolbar__row-count-selected">{selectedCount}</span>/{data.length}</>
      ) : (
        <>{data.length}</>
      )}
    </button>
  );

  return (
    <div className="kz-toolbar">
      {/* Left: Search + Row count + Edit mode actions */}
      <div className="kz-toolbar__left">
        {showSearch && (
          <ToolbarSearchInput value={searchTerm} onChange={onSearchChange} />
        )}

        {/* Row count badge - right next to search */}
        {rowCountBadge}

        {/* Add Row button: always visible when onAddRow is provided */}
        {showAddRow && onAddRow && (
          <>
            {showSearch && <ToolbarSeparator />}
            <ToolbarButton
              label={locale.toolbarAddRow}
              icon={<AddRowIcon />}
              onClick={onAddRow}
            />
          </>
        )}

        {/* Edit mode: Save & Cancel buttons */}
        {editMode && (
          <>
            {showSearch && <ToolbarSeparator />}
            <ToolbarButton
              label={locale.toolbarSave}
              icon={<SaveIcon />}
              onClick={onSaveAll ?? (() => {})}
              variant="primary"
            />
            <ToolbarButton
              label={locale.toolbarCancel}
              icon={<CancelIcon />}
              onClick={onCancelAll ?? (() => {})}
              variant="danger"
            />
          </>
        )}

        {/* Custom buttons - grouped with left side actions */}
        {hasCustomButtons && (
          <>
            <ToolbarSeparator />
            <div className="kz-toolbar__custom">
              {customButtons.map((btn: ToolbarButtonConfig) => (
                <ToolbarButton
                  key={btn.id}
                  label={btn.label}
                  icon={btn.icon}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  variant={btn.variant}
                  title={btn.title}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Built-in buttons */}
      <div className="kz-toolbar__right">

        {showExcel && (
          <ToolbarButton
            label={locale.toolbarExportExcel}
            icon={<ExcelIcon />}
            onClick={handleExcelExport}
          />
        )}

        {showPdf && (
          <ToolbarButton
            label={locale.toolbarExportPdf}
            icon={<PdfIcon />}
            onClick={handlePdfExport}
          />
        )}

        {showColumns && (
          <>
            <button
              ref={colBtnRef}
              type="button"
              className="kz-toolbar__btn"
              onClick={handleColumnToggle}
              title={locale.columnVisibility}
            >
              <span className="kz-toolbar__btn-icon"><ColumnsIcon /></span>
              <span className="kz-toolbar__btn-label">{locale.toolbarColumns}</span>
            </button>

            {columnPanelOpen && (
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
                    columns={allColumns as GridColumnDef[]}
                    visibility={visibility}
                    onToggle={onToggleColumn}
                    onShowAll={onShowAll}
                    onHideAll={onHideAll}
                    onClose={() => setColumnPanelOpen(false)}
                  />
                </div>
              </Portal>
            )}
          </>
        )}

        {showSettings && settings && (
          <>
            <button
              ref={settingsBtnRef}
              type="button"
              className="kz-toolbar__btn"
              onClick={handleSettingsToggle}
              title={locale.toolbarSettings}
            >
              <span className="kz-toolbar__btn-icon"><SettingsIcon /></span>
              <span className="kz-toolbar__btn-label">{locale.toolbarSettings}</span>
            </button>

            {settingsPanelOpen && (
              <Portal>
                <div
                  className="kz-grid"
                  style={{
                    ...cssVars,
                    position: 'fixed',
                    top: settingsPanelPos.top,
                    left: settingsPanelPos.left,
                    zIndex: 99999,
                    border: 'none',
                    background: 'transparent',
                  }}
                >
                  <GridSettingsPanel
                    columns={allColumns as GridColumnDef[]}
                    settings={settings}
                    onSelectionModeChange={onSelectionModeChange ?? (() => {})}
                    onHeaderFilterChange={onHeaderFilterChange ?? (() => {})}
                    onFooterAggregationChange={onFooterAggregationChange ?? (() => {})}
                    onStripedRowsChange={onStripedRowsChange ?? (() => {})}
                    onResetSorting={onResetSorting ?? (() => {})}
                    onResetAll={onResetAll ?? (() => {})}
                    onClose={() => setSettingsPanelOpen(false)}
                  />
                </div>
              </Portal>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export const GridToolbar = React.memo(GridToolbarInner) as typeof GridToolbarInner;
