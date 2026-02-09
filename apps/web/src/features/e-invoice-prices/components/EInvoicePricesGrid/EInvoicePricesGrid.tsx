import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { eInvoicePriceColumnDefs } from "./columnDefs";
import type { EInvoicePriceItem } from "../../types/eInvoicePrice.types";

interface EInvoicePricesGridProps {
  data: EInvoicePriceItem[];
  loading: boolean;
  onRowDoubleClick?: (item: EInvoicePriceItem) => void;
  onSelectionChanged?: (item: EInvoicePriceItem | null) => void;
}

export function EInvoicePricesGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
}: EInvoicePricesGridProps) {
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
    (row: EInvoicePriceItem) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: EInvoicePriceItem) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const columns: GridColumnDef<EInvoicePriceItem>[] =
    eInvoicePriceColumnDefs.map((col) => ({
      ...col,
      cellClassName: (_value: unknown, row: EInvoicePriceItem) => {
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
      <Grid<EInvoicePriceItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar
        stateKey="e-invoice-prices"
      />
    </div>
  );
}
