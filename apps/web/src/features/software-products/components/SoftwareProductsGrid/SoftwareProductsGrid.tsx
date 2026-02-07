import { useCallback } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { softwareProductColumns } from "./columnDefs";
import type { SoftwareProduct } from "../../types";

interface SoftwareProductsGridProps {
  data: SoftwareProduct[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (product: SoftwareProduct) => void;
}

export function SoftwareProductsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: SoftwareProductsGridProps) {
  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        onSortChange(id, desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: SoftwareProduct) => {
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }
    },
    [onRowDoubleClick]
  );

  return (
    <div className="flex-1 min-h-0">
      <Grid<SoftwareProduct>
        data={data}
        columns={softwareProductColumns}
        loading={loading}
        height="100%"
        locale="tr"
        stripedRows
        stateKey="software-products-grid"
        getRowId={(row) => row._id}
        onSortChange={handleSortChange}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{ exportFileName: "yazilim-urunleri" }}
      />
    </div>
  );
}
