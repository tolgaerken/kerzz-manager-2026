import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type GridReadyEvent,
  type SelectionChangedEvent,
  themeQuartz,
} from "ag-grid-community";
import { tokenColumnDefs } from "./columnDefs";
import type { AutoPaymentTokenItem } from "../../types/automatedPayment.types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AutoPaymentTokensGridProps {
  data: AutoPaymentTokenItem[];
  loading: boolean;
  onSelectionChanged: (items: AutoPaymentTokenItem[]) => void;
}

export function AutoPaymentTokensGrid({
  data,
  loading,
  onSelectionChanged,
}: AutoPaymentTokensGridProps) {
  const gridRef = useRef<AgGridReact<AutoPaymentTokenItem>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent<AutoPaymentTokenItem>) => {
      params.api.sizeColumnsToFit();
    },
    []
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<AutoPaymentTokenItem>) => {
      const selectedRows = event.api.getSelectedRows();
      onSelectionChanged(selectedRows);
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
      <AgGridReact<AutoPaymentTokenItem>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={tokenColumnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onSelectionChanged={handleSelectionChanged}
        loading={loading}
        rowSelection={{ mode: "multiRow", checkboxes: true }}
        suppressCellFocus={true}
        animateRows={false}
        enableCellTextSelection={true}
        getRowId={(params) => params.data._id}
        rowBuffer={20}
        suppressScrollOnNewData={true}
      />
    </div>
  );
}
