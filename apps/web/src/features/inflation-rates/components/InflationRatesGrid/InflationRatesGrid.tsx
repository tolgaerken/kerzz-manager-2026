import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { inflationRateColumnDefs } from "./columnDefs";
import type { InflationRateItem } from "../../types";

interface InflationRatesGridProps {
  data: InflationRateItem[];
  loading: boolean;
  selectedItem: InflationRateItem | null;
  onSelectionChanged: (item: InflationRateItem | null) => void;
  onRowDoubleClick?: (item: InflationRateItem) => void;
}

export function InflationRatesGrid({
  data,
  loading,
  selectedItem,
  onSelectionChanged,
  onRowDoubleClick,
}: InflationRatesGridProps) {
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

  const handleRowClick = useCallback(
    (row: InflationRateItem) => {
      if (selectedItem?._id === row._id) {
        onSelectionChanged(null);
        return;
      }
      onSelectionChanged(row);
    },
    [selectedItem, onSelectionChanged],
  );

  const columns: GridColumnDef<InflationRateItem>[] = inflationRateColumnDefs.map(
    (col) => ({
      ...col,
      cellClassName: (value: unknown, row: InflationRateItem) => {
        const original =
          typeof col.cellClassName === "function"
            ? col.cellClassName(value, row)
            : col.cellClassName || "";
        return selectedItem?._id === row._id
          ? `${original} bg-[var(--color-primary)]/10`.trim()
          : original;
      },
    }),
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<InflationRateItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={onRowDoubleClick}
        toolbar
        stateKey="inflation-rates"
      />
    </div>
  );
}
