import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type GridReadyEvent,
  type SortChangedEvent,
  themeQuartz
} from "ag-grid-community";
import { contractColumnDefs } from "./columnDefs";
import type { Contract } from "../../types";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface ContractsGridProps {
  data: Contract[];
  loading: boolean;
  totalRows: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (contract: Contract) => void;
}

export function ContractsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: ContractsGridProps) {
  const gridRef = useRef<AgGridReact<Contract>>(null);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent<Contract>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSortChanged = useCallback(
    (event: SortChangedEvent<Contract>) => {
      const sortModel = event.api.getColumnState().find((col) => col.sort);
      if (sortModel && sortModel.colId) {
        onSortChange(sortModel.colId, sortModel.sort as "asc" | "desc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClicked = useCallback(
    (event: { data: Contract | undefined }) => {
      if (event.data && onRowDoubleClick) {
        onRowDoubleClick(event.data);
      }
    },
    [onRowDoubleClick]
  );

  // Custom theme based on quartz
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
      <AgGridReact<Contract>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={contractColumnDefs}
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
        // Virtual scroll optimizations
        rowBuffer={20}
        suppressScrollOnNewData={true}
        debounceVerticalScrollbar={true}
      />
    </div>
  );
}
