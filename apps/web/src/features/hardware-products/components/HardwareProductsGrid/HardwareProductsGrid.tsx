import { useCallback } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { hardwareProductColumns } from "./columnDefs";
import type { HardwareProduct } from "../../types";

interface HardwareProductsGridProps {
  data: HardwareProduct[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (product: HardwareProduct) => void;
}

export function HardwareProductsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: HardwareProductsGridProps) {
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
    (row: HardwareProduct) => {
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }
    },
    [onRowDoubleClick]
  );

  return (
    <div className="flex-1 min-h-0">
      <Grid<HardwareProduct>
        data={data}
        columns={hardwareProductColumns}
        loading={loading}
        height="100%"
        locale="tr"
        stripedRows
        stateKey="hardware-products-grid"
        getRowId={(row) => row._id}
        onSortChange={handleSortChange}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={{ exportFileName: "donanim-urunleri" }}
      />
    </div>
  );
}
