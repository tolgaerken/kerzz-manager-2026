import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridReadyEvent,
  type SortChangedEvent,
  themeQuartz
} from "ag-grid-community";
import { paymentLinkColumnDefs } from "./columnDefs";
import { PaymentLinkActionsCell } from "./PaymentLinkActionsCell";
import type { PaymentLinkItem } from "../../types/payment.types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface PaymentLinksGridProps {
  data: PaymentLinkItem[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onCopyLink?: (item: PaymentLinkItem) => void;
  onResendNotify?: (item: PaymentLinkItem) => void;
}

export function PaymentLinksGrid({
  data,
  loading,
  onSortChange,
  onCopyLink,
  onResendNotify
}: PaymentLinksGridProps) {
  const gridRef = useRef<AgGridReact<PaymentLinkItem>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true
    }),
    []
  );

  const actionsColDef: ColDef<PaymentLinkItem>[] = useMemo(() => {
    if (!onCopyLink && !onResendNotify) return [];
    return [
      {
        headerName: "İşlemler",
        width: 180,
        sortable: false,
        cellRenderer: PaymentLinkActionsCell
      }
    ];
  }, [onCopyLink, onResendNotify]);

  const gridContext = useMemo(
    () => ({ onCopyLink, onResendNotify }),
    [onCopyLink, onResendNotify]
  );

  const columnDefs = useMemo(
    () => [...paymentLinkColumnDefs, ...actionsColDef],
    [actionsColDef]
  );

  const onGridReady = useCallback((params: GridReadyEvent<PaymentLinkItem>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSortChanged = useCallback(
    (event: SortChangedEvent<PaymentLinkItem>) => {
      const sortModel = event.api.getColumnState().find((col) => col.sort);
      if (sortModel && sortModel.colId) {
        onSortChange(sortModel.colId, sortModel.sort as "asc" | "desc");
      }
    },
    [onSortChange]
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
    headerHeight: 44
  });

  return (
    <div className="h-full w-full flex-1">
      <AgGridReact<PaymentLinkItem>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        context={gridContext}
        onGridReady={onGridReady}
        onSortChanged={handleSortChanged}
        loading={loading}
        rowSelection={{ mode: "singleRow" }}
        suppressCellFocus={true}
        animateRows={false}
        suppressMovableColumns={false}
        enableCellTextSelection={true}
        getRowId={(params) => params.data._id}
        rowBuffer={20}
        suppressScrollOnNewData={true}
        debounceVerticalScrollbar={true}
      />
    </div>
  );
}
