import { useCallback, useMemo } from "react";
import { Grid, type SortingState, type ToolbarButtonConfig } from "@kerzz/grid";
import { buildCustomerColumnDefs } from "./columnDefs";
import type { Customer } from "../../types";

interface CustomersGridProps {
  data: Customer[];
  loading: boolean;
  segmentMap: Record<string, string>;
  selectedId?: string | null;
  toolbarButtons?: ToolbarButtonConfig[];
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowClick?: (customer: Customer) => void;
  onRowDoubleClick?: (customer: Customer) => void;
}

export function CustomersGrid({
  data,
  loading,
  segmentMap,
  selectedId,
  toolbarButtons,
  onSortChange,
  onRowClick,
  onRowDoubleClick
}: CustomersGridProps) {
  const columns = useMemo(() => buildCustomerColumnDefs(segmentMap), [segmentMap]);

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowClick = useCallback(
    (row: Customer) => {
      onRowClick?.(row);
    },
    [onRowClick]
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
        columns={columns}
        height="100%"
        width="100%"
        locale="tr"
        loading={loading}
        stateKey="customers-grid"
        stateStorage="localStorage"
        getRowId={(row) => row._id}
        selectionMode="single"
        selectedIds={selectedId ? [selectedId] : []}
        onSortChange={handleSortChange}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{
          showSearch: true,
          showColumnVisibility: true,
          showExcelExport: true,
          showPdfExport: false,
          customButtons: toolbarButtons
        }}
      />
    </div>
  );
}
