import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { createInvoiceColumnDefs } from "./columnDefs";
import type { Invoice } from "../../types";

interface InvoicesGridProps {
  data: Invoice[];
  loading: boolean;
  autoPaymentCustomerIds: Set<string>;
  pendingPaymentInvoiceNos?: Set<string>;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (invoice: Invoice) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  customButtons?: ToolbarButtonConfig[];
}

export function InvoicesGrid({
  data,
  loading,
  autoPaymentCustomerIds,
  pendingPaymentInvoiceNos,
  onSortChange,
  onRowDoubleClick,
  selectedIds,
  onSelectionChange,
  customButtons
}: InvoicesGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(500);

  // Dinamik yükseklik hesaplama
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

  // Sütun tanımları
  const columns = useMemo(
    () => createInvoiceColumnDefs(autoPaymentCustomerIds, pendingPaymentInvoiceNos),
    [autoPaymentCustomerIds, pendingPaymentInvoiceNos]
  );

  // SortingState -> (sortField, sortOrder) dönüşümü
  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        onSortChange(sorting[0].id, sorting[0].desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  // Row double click
  const handleRowDoubleClick = useCallback(
    (row: Invoice) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<Invoice>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowDoubleClick={handleRowDoubleClick}
        onSortChange={handleSortChange}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        stripedRows
        stateKey="invoices-grid"
        toolbar={{
          exportFileName: "faturalar",
          customButtons: customButtons ?? []
        }}
      />
    </div>
  );
}
