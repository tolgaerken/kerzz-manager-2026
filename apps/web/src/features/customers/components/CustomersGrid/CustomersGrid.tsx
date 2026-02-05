import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type GridReadyEvent,
  type SortChangedEvent,
  themeQuartz
} from "ag-grid-community";
import { customerColumnDefs } from "./columnDefs";
import type { Customer } from "../../types";

ModuleRegistry.registerModules([AllCommunityModule]);

interface CustomersGridProps {
  data: Customer[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (customer: Customer) => void;
}

export function CustomersGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: CustomersGridProps) {
  const gridRef = useRef<AgGridReact<Customer>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent<Customer>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSortChanged = useCallback(
    (event: SortChangedEvent<Customer>) => {
      const sortModel = event.api.getColumnState().find((col) => col.sort);
      if (sortModel && sortModel.colId) {
        onSortChange(sortModel.colId, sortModel.sort as "asc" | "desc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClicked = useCallback(
    (event: { data: Customer | undefined }) => {
      if (event.data && onRowDoubleClick) {
        onRowDoubleClick(event.data);
      }
    },
    [onRowDoubleClick]
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
      <AgGridReact<Customer>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={customerColumnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onSortChanged={handleSortChanged}
        onRowDoubleClicked={handleRowDoubleClicked}
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
