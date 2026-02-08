import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef, ToolbarButtonConfig } from "@kerzz/grid";
import { offerColumnDefs } from "./columnDefs";
import type { Offer } from "../../types/offer.types";

interface OffersGridProps {
  data: Offer[];
  loading: boolean;
  onRowDoubleClick?: (item: Offer) => void;
  onSelectionChanged?: (item: Offer | null) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  toolbarButtons?: ToolbarButtonConfig[];
}

export function OffersGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
  onSortChange,
  toolbarButtons,
}: OffersGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleRowClick = useCallback(
    (row: Offer) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: Offer) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const columns: GridColumnDef<Offer>[] = offerColumnDefs.map((col) => ({
    ...col,
    cellClassName: (_value: unknown, row: Offer) => {
      const original =
        typeof col.cellClassName === "function"
          ? col.cellClassName(_value, row)
          : col.cellClassName || "";
      return selectedId === row._id
        ? `${original} bg-[var(--color-primary)]/10`.trim()
        : original;
    },
  }));

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<Offer>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onSortChange={(sorting) => {
          if (sorting.length > 0) {
            const sort = sorting[0];
            onSortChange?.(sort.id, sort.desc ? "desc" : "asc");
          }
        }}
        stripedRows
        toolbar
        toolbarButtons={toolbarButtons}
        stateKey="offers"
      />
    </div>
  );
}
