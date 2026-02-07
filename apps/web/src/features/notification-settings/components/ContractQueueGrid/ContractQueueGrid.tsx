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
import { contractQueueColumnDefs } from "./columnDefs";
import type { QueueContractItem } from "../../types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface ContractQueueGridProps {
  data: QueueContractItem[];
  loading: boolean;
  onSelectionChanged: (items: QueueContractItem[]) => void;
  onPreviewEmail: (id: string) => void;
  onPreviewSms: (id: string) => void;
}

function ActionsCellRenderer(params: {
  data: QueueContractItem;
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

export function ContractQueueGrid({
  data,
  loading,
  onSelectionChanged,
  onPreviewEmail,
  onPreviewSms,
}: ContractQueueGridProps) {
  const gridRef = useRef<AgGridReact<QueueContractItem>>(null);

  const context = useMemo(
    () => ({ onPreviewEmail, onPreviewSms }),
    [onPreviewEmail, onPreviewSms]
  );

  const columnDefs = useMemo<ColDef<QueueContractItem>[]>(
    () => [
      ...contractQueueColumnDefs,
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

  const onGridReady = useCallback((params: GridReadyEvent<QueueContractItem>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<QueueContractItem>) => {
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
      <AgGridReact<QueueContractItem>
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
            Bildirim bekleyen kontrat bulunamadı.
          </span>
        )}
      />
    </div>
  );
}
