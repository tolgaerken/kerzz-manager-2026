import React, { useCallback, useRef, useState } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ToolbarConfig, ToolbarButtonConfig } from '../../types/toolbar.types';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarSeparator } from './ToolbarSeparator';
import { ToolbarSearchInput } from './ToolbarSearchInput';
import { ExcelIcon, PdfIcon, ColumnsIcon, SaveIcon, CancelIcon, AddRowIcon } from './ToolbarIcons';
import { ColumnVisibilityPanel } from '../ColumnManager/ColumnVisibilityPanel';
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
}: GridToolbarProps<TData>) {
  const locale = useLocale();
  const [columnPanelOpen, setColumnPanelOpen] = useState(false);
  const colBtnRef = useRef<HTMLButtonElement>(null);

  const showSearch = config.showSearch !== false;
  const showExcel = config.showExcelExport !== false;
  const showPdf = config.showPdfExport !== false;
  const showColumns = config.showColumnVisibility !== false;
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

  const hasBuiltInButtons = showExcel || showPdf || showColumns;
  const hasCustomButtons = customButtons.length > 0;

  return (
    <div className="kz-toolbar">
      {/* Left: Search + Custom buttons + Edit mode actions */}
      <div className="kz-toolbar__left">
        {showSearch && (
          <ToolbarSearchInput value={searchTerm} onChange={onSearchChange} />
        )}
        {customButtons.map((btn: ToolbarButtonConfig) => (
          <ToolbarButton
            key={btn.id}
            label={btn.label}
            icon={btn.icon}
            onClick={btn.onClick}
            disabled={btn.disabled}
            variant={btn.variant}
          />
        ))}

        {/* Add Row button: always visible when onAddRow is provided */}
        {showAddRow && onAddRow && (
          <>
            {(hasCustomButtons || showSearch) && <ToolbarSeparator />}
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
            {!(showAddRow && onAddRow) && (hasCustomButtons || showSearch) && <ToolbarSeparator />}
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
      </div>

      {/* Right: Built-in buttons */}
      <div className="kz-toolbar__right">
        {hasCustomButtons && hasBuiltInButtons && <ToolbarSeparator />}

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
      </div>
    </div>
  );
}

export const GridToolbar = React.memo(GridToolbarInner) as typeof GridToolbarInner;
