import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { tokenColumnDefs } from "./columnDefs";
import type { AutoPaymentTokenItem } from "../../types/automatedPayment.types";

interface AutoPaymentTokensGridProps {
  data: AutoPaymentTokenItem[];
  loading: boolean;
  onSelectionChanged: (items: AutoPaymentTokenItem[]) => void;
}

export function AutoPaymentTokensGrid({
  data,
  loading,
  onSelectionChanged,
}: AutoPaymentTokensGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    (row: AutoPaymentTokenItem) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(row._id)) {
        newSet.delete(row._id);
      } else {
        newSet.add(row._id);
      }
      setSelectedIds(newSet);
      const selectedItems = data.filter((item) => newSet.has(item._id));
      onSelectionChanged(selectedItems);
    },
    [data, onSelectionChanged, selectedIds]
  );

  const columns: GridColumnDef<AutoPaymentTokenItem>[] = tokenColumnDefs.map(
    (col) => ({
      ...col,
      cellClassName: (_value: unknown, row: AutoPaymentTokenItem) => {
        const original =
          typeof col.cellClassName === "function"
            ? col.cellClassName(_value, row)
            : col.cellClassName || "";
        return selectedIds.has(row._id)
          ? `${original} bg-blue-50 dark:bg-blue-900/20`.trim()
          : original;
      },
    })
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<AutoPaymentTokenItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        stripedRows
        toolbar
        stateKey="auto-payment-tokens"
      />
    </div>
  );
}
