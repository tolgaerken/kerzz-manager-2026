import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { eDocCreditColumnDefs } from "./columnDefs";
import type { EDocCreditItem } from "../../types/eDocCredit.types";

interface EDocCreditsGridProps {
  data: EDocCreditItem[];
  loading: boolean;
  onRowDoubleClick?: (item: EDocCreditItem) => void;
  onSelectionChanged?: (item: EDocCreditItem | null) => void;
}

export function EDocCreditsGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
}: EDocCreditsGridProps) {
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
    (row: EDocCreditItem) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged]
  );

  const handleRowDoubleClick = useCallback(
    (row: EDocCreditItem) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  const columns: GridColumnDef<EDocCreditItem>[] = eDocCreditColumnDefs.map(
    (col) => ({
      ...col,
      cellClassName: (_value: unknown, row: EDocCreditItem) => {
        const original =
          typeof col.cellClassName === "function"
            ? col.cellClassName(_value, row)
            : col.cellClassName || "";
        return selectedId === row._id
          ? `${original} bg-blue-50 dark:bg-blue-900/20`.trim()
          : original;
      },
    })
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<EDocCreditItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar
        stateKey="e-doc-credits"
      />
    </div>
  );
}
