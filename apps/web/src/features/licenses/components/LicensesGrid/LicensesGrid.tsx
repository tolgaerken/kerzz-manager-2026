import { useCallback, useMemo } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { createLicenseColumnDefs } from "./columnDefs";
import type { License } from "../../types";
import { useCustomerLookup } from "../../../lookup";

interface LicensesGridProps {
  data: License[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (license: License) => void;
}

export function LicensesGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick
}: LicensesGridProps) {
  const { customerMap } = useCustomerLookup();

  // Column definitions'ı customerMap ile oluştur
  const columnDefs = useMemo(() => {
    return createLicenseColumnDefs(customerMap);
  }, [customerMap]);

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: License) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  return (
    <div className="h-full w-full flex-1">
      <Grid<License>
        data={data}
        columns={columnDefs}
        height="100%"
        width="100%"
        locale="tr"
        loading={loading}
        stateKey="licenses-grid"
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
