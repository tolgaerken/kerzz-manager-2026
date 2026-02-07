import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { paymentPlanColumnDefs } from "./columnDefs";
import type { PaymentPlanItem } from "../../types/automatedPayment.types";

interface PaymentPlanGridProps {
  data: PaymentPlanItem[];
  loading: boolean;
  onSelectionChanged: (item: PaymentPlanItem | null) => void;
}

export function PaymentPlanGrid({
  data,
  loading,
  onSelectionChanged,
}: PaymentPlanGridProps) {
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
    (row: PaymentPlanItem) => {
      setSelectedId((prev) => {
        if (prev === row._id) {
          onSelectionChanged(null);
          return null;
        }
        onSelectionChanged(row);
        return row._id;
      });
    },
    [onSelectionChanged]
  );

  const columns: GridColumnDef<PaymentPlanItem>[] = paymentPlanColumnDefs.map(
    (col) => ({
      ...col,
      cellClassName: (_value: unknown, row: PaymentPlanItem) => {
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
      <Grid<PaymentPlanItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        toolbar
        stateKey="payment-plans"
      />
    </div>
  );
}
