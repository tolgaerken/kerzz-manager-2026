import { useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { MobileFilterColumnConfig, MobileSortColumnConfig, ToolbarButtonConfig } from "@kerzz/grid";
import type { ErpBalance } from "../../../erp-balances";
import { createColumnDefs } from "./columnDefs";
import { ReceivableCard } from "./ReceivableCard";

// Mobil filtre konfigürasyonu
const mobileFilterColumns: MobileFilterColumnConfig[] = [
  { id: "CariKodu", header: "Cari Kodu", type: "text", accessorKey: "CariKodu" },
  { id: "CariUnvan", header: "Cari Unvan", type: "text", accessorKey: "CariUnvan" },
  { id: "internalFirm", header: "Firma", type: "select", accessorKey: "internalFirm" },
  { id: "GrupKodu", header: "Grup", type: "select", accessorKey: "GrupKodu" },
  { id: "CariBakiye", header: "Bakiye", type: "number", accessorKey: "CariBakiye" },
  { id: "ToplamGecikme", header: "Vadesi Geçmiş", type: "number", accessorKey: "ToplamGecikme" },
  { id: "VadesiGelmemis", header: "Vadesi Gelmemiş", type: "number", accessorKey: "VadesiGelmemis" },
  { id: "Bugun", header: "Bugün", type: "number", accessorKey: "Bugun" },
  { id: "GECIKMEGUN", header: "Gecikme (Gün)", type: "number", accessorKey: "GECIKMEGUN" },
];

// Mobil sıralama konfigürasyonu
const mobileSortColumns: MobileSortColumnConfig[] = [
  { id: "CariKodu", header: "Cari Kodu", accessorKey: "CariKodu" },
  { id: "CariUnvan", header: "Cari Unvan", accessorKey: "CariUnvan" },
  { id: "internalFirm", header: "Firma", accessorKey: "internalFirm" },
  { id: "GrupKodu", header: "Grup", accessorKey: "GrupKodu" },
  { id: "CariBakiye", header: "Bakiye", accessorKey: "CariBakiye" },
  { id: "ToplamGecikme", header: "Vadesi Geçmiş", accessorKey: "ToplamGecikme" },
  { id: "VadesiGelmemis", header: "Vadesi Gelmemiş", accessorKey: "VadesiGelmemis" },
  { id: "Bugun", header: "Bugün", accessorKey: "Bugun" },
  { id: "GECIKMEGUN", header: "Gecikme (Gün)", accessorKey: "GECIKMEGUN" },
];

interface ReceivablesGridProps {
  data: ErpBalance[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowDoubleClick?: (row: ErpBalance) => void;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
  /** Toolbar'da gösterilecek ek custom butonlar */
  toolbarCustomButtons?: ToolbarButtonConfig[];
}

export function ReceivablesGrid({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onRowDoubleClick,
  onScrollDirectionChange,
  toolbarCustomButtons,
}: ReceivablesGridProps) {
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

  const columns = useMemo(() => createColumnDefs(), []);

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<ErpBalance>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowDoubleClick={onRowDoubleClick}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        stateKey="receivables-grid"
        toolbar={{
          exportFileName: "alacak_listesi",
          customButtons: toolbarCustomButtons,
        }}
        mobileConfig={{
          cardRenderer: (props) => (
            <ReceivableCard
              item={props.item}
              onClick={() => props.onDoubleTap()}
              selected={props.isSelected}
              onSelect={() => props.onSelect()}
            />
          ),
          filterColumns: mobileFilterColumns,
          sortColumns: mobileSortColumns,
          estimatedCardHeight: 180,
          onScrollDirectionChange,
        }}
      />
    </div>
  );
}
