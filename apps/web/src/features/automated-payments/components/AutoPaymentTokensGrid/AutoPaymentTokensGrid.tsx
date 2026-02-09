import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
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

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        onSelectionChanged([]);
        return;
      }
      const selectedIdSet = new Set(selectedIds);
      const selectedItems = data.filter((item) => selectedIdSet.has(item._id));
      onSelectionChanged(selectedItems);
    },
    [data, onSelectionChanged]
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<AutoPaymentTokenItem>
        data={data}
        columns={tokenColumnDefs}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        toolbar
        stateKey="auto-payment-tokens"
      />
    </div>
  );
}
