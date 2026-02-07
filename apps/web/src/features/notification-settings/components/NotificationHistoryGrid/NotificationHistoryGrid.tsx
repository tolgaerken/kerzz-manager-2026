import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type GridReadyEvent,
  themeQuartz,
} from "ag-grid-community";
import { notificationHistoryColumnDefs } from "./columnDefs";
import type { NotificationLog } from "../../types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface NotificationHistoryGridProps {
  data: NotificationLog[];
  loading: boolean;
}

export function NotificationHistoryGrid({
  data,
  loading,
}: NotificationHistoryGridProps) {
  const gridRef = useRef<AgGridReact<NotificationLog>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent<NotificationLog>) => {
    params.api.sizeColumnsToFit();
  }, []);

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
      <AgGridReact<NotificationLog>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={notificationHistoryColumnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        loading={loading}
        rowSelection={{ mode: "singleRow" }}
        suppressCellFocus={true}
        animateRows={false}
        enableCellTextSelection={true}
        getRowId={(params) => params.data._id}
        rowBuffer={20}
        suppressScrollOnNewData={true}
        debounceVerticalScrollbar={true}
        noRowsOverlayComponent={() => (
          <span className="text-[var(--color-muted)]">
            Bildirim geçmişi bulunamadı.
          </span>
        )}
      />
    </div>
  );
}
