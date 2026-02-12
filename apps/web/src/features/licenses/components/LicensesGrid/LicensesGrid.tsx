import { useCallback, useMemo } from "react";
import { Grid, type ToolbarButtonConfig, type SortingState } from "@kerzz/grid";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { LicenseMobileList } from "./LicenseMobileList";
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
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export function LicensesGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick,
  onRowSelect,
  onSelectionChange,
  selectedIds,
  toolbarButtons,
  onScrollDirectionChange
}: LicensesGridProps) {
  const isMobile = useIsMobile();
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

  // Mobile view - single tap opens modal, no multiselect
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <LicenseMobileList
          data={data}
          loading={loading}
          onCardClick={(license) => {
            onRowSelect?.(license);
            onRowDoubleClick?.(license);
          }}
          onScrollDirectionChange={onScrollDirectionChange}
        />
      </div>
    );
  }

  // Desktop view
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
