import { useCallback } from "react";
import { Grid, type SortingState } from "@kerzz/grid";
import { customerSegmentColumnDefs } from "./columnDefs";
import type { CustomerSegment } from "../../types";

interface CustomerSegmentsGridProps {
  data: CustomerSegment[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (segment: CustomerSegment) => void;
}

export function CustomerSegmentsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: CustomerSegmentsGridProps) {
  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: CustomerSegment) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  return (
    <div className="h-full w-full flex-1">
      <Grid<CustomerSegment>
        data={data}
        columns={customerSegmentColumnDefs}
        height="100%"
        width="100%"
        locale="tr"
        loading={loading}
        stateKey="customer-segments-grid"
        stateStorage="localStorage"
        getRowId={(row) => row._id}
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
