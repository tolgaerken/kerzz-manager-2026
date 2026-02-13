import { useCallback, useMemo } from "react";
import { Grid, type ToolbarButtonConfig, type SortingState, type MobileFilterColumnConfig, type MobileSortColumnConfig } from "@kerzz/grid";
import { LicenseCard } from "./LicenseCard";
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

// Mobil filtre konfigürasyonu
const mobileFilterColumns: MobileFilterColumnConfig[] = [
  { id: "licenseId", header: "Lisans No", type: "number", accessorKey: "licenseId" },
  { id: "brandName", header: "Tabela Adı", type: "text", accessorKey: "brandName" },
  { id: "customerName", header: "Müşteri", type: "text", accessorKey: "customerName" },
  { id: "type", header: "Tip", type: "select", accessorKey: "type" },
  { id: "companyType", header: "Şirket Tipi", type: "select", accessorKey: "companyType" },
  { id: "active", header: "Aktif", type: "boolean", accessorKey: "active" },
  { id: "block", header: "Bloke", type: "boolean", accessorKey: "block" },
  { id: "haveContract", header: "Kontrat", type: "boolean", accessorKey: "haveContract" },
  { id: "category", header: "Kategori", type: "select", accessorKey: "category" },
];

// Mobil sıralama konfigürasyonu
const mobileSortColumns: MobileSortColumnConfig[] = [
  { id: "licenseId", header: "Lisans No", accessorKey: "licenseId" },
  { id: "brandName", header: "Tabela Adı", accessorKey: "brandName" },
  { id: "customerName", header: "Müşteri", accessorKey: "customerName" },
  { id: "type", header: "Tip", accessorKey: "type" },
  { id: "lastOnline", header: "Son Online", accessorKey: "lastOnline" },
];

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
        mobileConfig={{
          cardRenderer: (props) => (
            <LicenseCard
              license={props.item}
              onClick={() => {
                onRowSelect?.(props.item);
                props.onDoubleTap();
              }}
              selected={props.isSelected}
            />
          ),
          filterColumns: mobileFilterColumns,
          sortColumns: mobileSortColumns,
          estimatedCardHeight: 140,
          onScrollDirectionChange,
        }}
      />
    </div>
  );
}
