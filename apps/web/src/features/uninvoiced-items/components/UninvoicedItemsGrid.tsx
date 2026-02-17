import { useEffect, useMemo, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { Grid } from "@kerzz/grid";
import type { MobileFilterColumnConfig, MobileSortColumnConfig, ToolbarButtonConfig } from "@kerzz/grid";
import type { UninvoicedItem } from "../types/uninvoiced-items.types";
import { uninvoicedItemsColumns } from "./uninvoicedItemsColumns";

// Mobil filtre konfigürasyonu
const mobileFilterColumns: MobileFilterColumnConfig[] = [
  { id: "contractNo", header: "Kontrat No", type: "text", accessorKey: "contractNo" },
  { id: "company", header: "Firma", type: "text", accessorKey: "company" },
  { id: "category", header: "Kategori", type: "select", accessorKey: "category" },
  { id: "description", header: "Açıklama", type: "text", accessorKey: "description" },
  { id: "contractId", header: "Kontrat ID", type: "select", accessorKey: "contractId" },
  { id: "id", header: "Kalem ID", type: "text", accessorKey: "id" },
];

// Mobil sıralama konfigürasyonu
const mobileSortColumns: MobileSortColumnConfig[] = [
  { id: "contractNo", header: "Kontrat No", accessorKey: "contractNo" },
  { id: "company", header: "Firma", accessorKey: "company" },
  { id: "category", header: "Kategori", accessorKey: "category" },
  { id: "description", header: "Açıklama", accessorKey: "description" },
  { id: "contractId", header: "Kontrat ID", accessorKey: "contractId" },
  { id: "id", header: "Kalem ID", accessorKey: "id" },
];

interface UninvoicedItemsGridProps {
  data: UninvoicedItem[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowDoubleClick?: (row: UninvoicedItem) => void;
  onInspect?: (row: UninvoicedItem) => void;
}

export function UninvoicedItemsGrid({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onRowDoubleClick,
  onInspect,
}: UninvoicedItemsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(500);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Toolbar butonları
  const toolbarCustomButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const selectedItem = selectedIds.length === 1
      ? data.find((item) => item.id === selectedIds[0])
      : null;

    return [
      {
        id: "inspect",
        label: "İncele",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          if (selectedItem && onInspect) {
            onInspect(selectedItem);
          }
        },
        disabled: selectedIds.length !== 1,
        tooltip: selectedIds.length !== 1
          ? "Tek bir kalem seçin"
          : "Kontrat detaylarını görüntüle",
      },
    ];
  }, [selectedIds, data, onInspect]);

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<UninvoicedItem>
        data={data}
        columns={uninvoicedItemsColumns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row.id}
        onRowDoubleClick={onRowDoubleClick}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        stateKey="uninvoiced-items-grid"
        toolbar={{
          exportFileName: "faturaya_dahil_edilmemis_kalemler",
          customButtons: toolbarCustomButtons,
        }}
        mobileConfig={{
          filterColumns: mobileFilterColumns,
          sortColumns: mobileSortColumns,
          estimatedCardHeight: 100,
        }}
      />
    </div>
  );
}
