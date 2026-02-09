import { useCallback, useMemo } from "react";
import { Grid, type ToolbarButtonConfig, type SortingState } from "@kerzz/grid";
import { createLicenseColumnDefs } from "./columnDefs";
import type { License } from "../../types";
import { useCustomerLookup } from "../../../lookup";

interface LicensesGridProps {
  data: License[];
  loading: boolean;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (license: License) => void;
  onRowSelect?: (license: License | null) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  toolbarButtons?: ToolbarButtonConfig[];
}

export function LicensesGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick,
  onRowSelect,
  onSelectionChange,
  selectedIds,
  toolbarButtons
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

  const handleRowClick = useCallback(
    (row: License) => {
      onRowSelect?.(row);
    },
    [onRowSelect]
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
        onSortChange={handleSortChange}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
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
