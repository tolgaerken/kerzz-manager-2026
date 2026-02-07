import { useCallback } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { customerColumnDefs } from "./columnDefs";
import type { Customer } from "../../types";

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
  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: Customer) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  return (
    <div className="h-full w-full flex-1">
      <Grid<Customer>
        data={data}
        columns={customerColumnDefs}
        height="100%"
        width="100%"
        locale="tr"
        loading={loading}
        stateKey="customers-grid"
        stateStorage="localStorage"
        getRowId={(row) => row._id}
        stripedRows
        onSortChange={handleSortChange}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{
          showSearch: true,
          showColumnVisibility: true,
          showExcelExport: true,
          showPdfExport: false
        }}
      />
    </div>
  );
}
