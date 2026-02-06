import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type GridReadyEvent,
  type SelectionChangedEvent,
  themeQuartz,
} from "ag-grid-community";
import { paymentPlanColumnDefs } from "./columnDefs";
import type { PaymentPlanItem } from "../../types/automatedPayment.types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PaymentPlanGridProps {
  data: PaymentPlanItem[];
  loading: boolean;
  onSelectionChanged: (item: PaymentPlanItem | null) => void;
}

export function PaymentPlanGrid({
  data,
  loading,
  onSelectionChanged,
}: PaymentPlanGridProps) {
  const gridRef = useRef<AgGridReact<PaymentPlanItem>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  const onGridReady = useCallback(
    (_params: GridReadyEvent<PaymentPlanItem>) => {
      // Yatay scroll icin kolonlari serbest birak
    },
    []
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<PaymentPlanItem>) => {
      const selected = event.api.getSelectedRows();
      onSelectionChanged(selected.length > 0 ? selected[0] : null);
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
      <AgGridReact<PaymentPlanItem>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={paymentPlanColumnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onSelectionChanged={handleSelectionChanged}
        loading={loading}
        rowSelection={{ mode: "singleRow" }}
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
