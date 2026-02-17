import { useCallback, useMemo } from "react";
import { Grid, type GridColumnDef, type ToolbarButtonConfig, type ToolbarConfig, type SortingState, type MobileFilterColumnConfig, type MobileSortColumnConfig } from "@kerzz/grid";
import { salesColumnDefs } from "./columnDefs";
import { SaleCard } from "./SaleCard";
import type { Sale } from "../../types/sale.types";

export interface SalesGridProps {
  data: Sale[];
  loading: boolean;
  onRowDoubleClick?: (item: Sale) => void;
  /** Tekil seçim callback'i (geriye uyumluluk) */
  onSelectionChanged?: (item: Sale | null) => void;
  /** Çoklu seçim için seçili ID'ler */
  selectedIds?: string[];
  /** Çoklu seçim callback'i */
  onSelectionChange?: (ids: string[]) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  toolbarButtons?: ToolbarButtonConfig[];
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

// Mobil filtre konfigürasyonu
const mobileFilterColumns: MobileFilterColumnConfig[] = [
  { id: "no", header: "No", type: "number", accessorKey: "no" },
  { id: "pipelineRef", header: "Referans", type: "text", accessorKey: "pipelineRef" },
  { id: "customerName", header: "Müşteri", type: "text", accessorKey: "customerName" },
  { id: "sellerName", header: "Satıcı", type: "text", accessorKey: "sellerName" },
  { id: "status", header: "Durum", type: "select", accessorKey: "status" },
  { id: "approved", header: "Onay", type: "boolean", accessorKey: "approved" },
  { id: "internalFirm", header: "Firma", type: "select", accessorKey: "internalFirm" },
  { id: "grandTotal", header: "Genel Toplam", type: "number", accessorKey: "grandTotal" },
];

// Mobil sıralama konfigürasyonu
const mobileSortColumns: MobileSortColumnConfig[] = [
  { id: "no", header: "No", accessorKey: "no" },
  { id: "customerName", header: "Müşteri", accessorKey: "customerName" },
  { id: "sellerName", header: "Satıcı", accessorKey: "sellerName" },
  { id: "saleDate", header: "Satış Tarihi", accessorKey: "saleDate" },
  { id: "grandTotal", header: "Genel Toplam", accessorKey: "grandTotal" },
  { id: "status", header: "Durum", accessorKey: "status" },
  { id: "createdAt", header: "Oluşturulma", accessorKey: "createdAt" },
];

export function SalesGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
  selectedIds,
  onSelectionChange,
  onSortChange,
  toolbarButtons,
  onScrollDirectionChange,
}: SalesGridProps) {
  const handleRowClick = useCallback(
    (row: Sale) => {
      onSelectionChanged?.(row);
    },
    [onSelectionChanged]
  );

  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      onSelectionChange?.(ids);
    },
    [onSelectionChange]
  );

  const handleRowDoubleClick = useCallback(
    (row: Sale) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0 && onSortChange) {
        const { id, desc } = sorting[0];
        onSortChange(id, desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const toolbarConfig: ToolbarConfig<Sale> = useMemo(
    () => ({
      customButtons: toolbarButtons,
    }),
    [toolbarButtons]
  );

  return (
    <div className="flex-1 min-h-0">
      <Grid<Sale>
        data={data}
        columns={salesColumnDefs as GridColumnDef<Sale>[]}
        locale="tr"
        height="100%"
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onSortChange={handleSortChange}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        stripedRows
        toolbar={toolbarConfig}
        stateKey="sales"
        mobileConfig={{
          cardRenderer: (props) => (
            <SaleCard
              sale={props.item}
              onClick={() => {
                onSelectionChanged?.(props.item);
                props.onSelect();
              }}
              selected={props.isSelected}
              onSelect={() => props.onSelect()}
              onPreview={() => {
                onSelectionChanged?.(props.item);
                props.onDoubleTap();
              }}
            />
          ),
          filterColumns: mobileFilterColumns,
          sortColumns: mobileSortColumns,
          estimatedCardHeight: 160,
          onScrollDirectionChange,
        }}
      />
    </div>
  );
}
