import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridReadyEvent,
  type SelectionChangedEvent,
  themeQuartz,
} from "ag-grid-community";
import { Eye, MessageSquare } from "lucide-react";
import { invoiceQueueColumnDefs } from "./columnDefs";
import type { QueueInvoiceItem } from "../../types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface InvoiceQueueGridProps {
  data: QueueInvoiceItem[];
  loading: boolean;
  onSelectionChanged: (items: QueueInvoiceItem[]) => void;
  onPreviewEmail: (id: string) => void;
  onPreviewSms: (id: string) => void;
}

function ActionsCellRenderer(params: {
  data: QueueInvoiceItem;
  context: { onPreviewEmail: (id: string) => void; onPreviewSms: (id: string) => void };
}) {
  if (!params.data) return null;
  return (
    <div className="flex items-center gap-1 h-full">
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onPreviewEmail(params.data.id);
        }}
        title="E-posta Önizleme"
        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          params.context.onPreviewSms(params.data.id);
        }}
        title="SMS Önizleme"
        className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function InvoiceQueueGrid({
  data,
  loading,
  onSelectionChanged,
  onPreviewEmail,
  onPreviewSms,
}: InvoiceQueueGridProps) {
  const gridRef = useRef<AgGridReact<QueueInvoiceItem>>(null);

  const context = useMemo(
    () => ({ onPreviewEmail, onPreviewSms }),
    [onPreviewEmail, onPreviewSms]
  );

  const columnDefs = useMemo<ColDef<QueueInvoiceItem>[]>(
    () => [
      ...invoiceQueueColumnDefs,
      {
        headerName: "İşlemler",
        width: 100,
        sortable: false,
        cellRenderer: ActionsCellRenderer,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent<QueueInvoiceItem>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<QueueInvoiceItem>) => {
      const selected = event.api.getSelectedRows();
      onSelectionChanged(selected);
    },
    [onSelectionChanged]
  );

  const customTheme = themeQuartz.withParams({
    backgroundColor: "var(--color-surface)",
    foregroundColor: "var(--color-foreground)",
    headerBackgroundColor: "var(--color-surface-elevated)",
    headerTextColor: "var(--color-foreground)",
    oddRowBackgroundColor: "var(--color-surface)",
    rowHoverColor: "var(--color-surface-elevated)",
    borderColor: "var(--color-border)",
    fontFamily: "inherit",
    fontSize: 13,
    headerFontSize: 12,
    rowHeight: 40,
    headerHeight: 44,
  });

  return (
    <div className="h-full w-full flex-1">
      <AgGridReact<QueueInvoiceItem>
        ref={gridRef}
        theme={customTheme}
        context={context}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onSelectionChanged={handleSelectionChanged}
        loading={loading}
        rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
        suppressCellFocus={true}
        animateRows={false}
        enableCellTextSelection={true}
        getRowId={(params) => params.data.id}
        rowBuffer={20}
        suppressScrollOnNewData={true}
        debounceVerticalScrollbar={true}
        noRowsOverlayComponent={() => (
          <span className="text-[var(--color-muted)]">
            Bildirim bekleyen fatura bulunamadı.
          </span>
        )}
      />
    </div>
  );
}
