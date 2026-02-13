import type { GridColumnDef } from './column.types';

export interface ToolbarButtonConfig {
  /** Unique button identifier */
  id: string;
  /** Button label text */
  label: string;
  /** Optional icon (ReactNode) */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button visual variant */
  variant?: 'default' | 'primary' | 'danger';
  /** Optional tooltip text (defaults to label) */
  title?: string;
}

export interface ToolbarConfig<TData = unknown> {
  /** Show global search input (default: true) */
  showSearch?: boolean;
  /** Show Excel/CSV export button (default: true) */
  showExcelExport?: boolean;
  /** Show PDF/Print export button (default: true) */
  showPdfExport?: boolean;
  /** Show column visibility button (default: true) */
  showColumnVisibility?: boolean;
  /** Show settings button (default: true) */
  showSettings?: boolean;
  /** Custom buttons to render in the toolbar */
  customButtons?: ToolbarButtonConfig[];
  /** Custom Excel export handler. If omitted, built-in CSV export is used */
  onExportExcel?: (data: TData[], columns: GridColumnDef<TData>[]) => void;
  /** Custom PDF export handler. If omitted, built-in print export is used */
  onExportPdf?: (data: TData[], columns: GridColumnDef<TData>[]) => void;
  /** File name for exports (without extension). Default: 'grid-export' */
  exportFileName?: string;
  /** Show add-row button when edit mode is active (default: true) */
  showAddRow?: boolean;
}
