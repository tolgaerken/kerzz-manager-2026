import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid, type ToolbarButtonConfig, type SortingState } from "@kerzz/grid";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { InvoiceMobileList } from "./InvoiceMobileList";
import { createInvoiceColumnDefs } from "./columnDefs";
import type { Invoice } from "../../types";

interface InvoicesGridProps {
  data: Invoice[];
  loading: boolean;
  autoPaymentCustomerIds: Set<string>;
  pendingPaymentInvoiceNos?: Set<string>;
  balanceMap?: Map<string, number>;
  onSortChange: (sortField: string, sortOrder: "asc" | "desc") => void;
  onRowDoubleClick?: (invoice: Invoice) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  customButtons?: ToolbarButtonConfig[];
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export function InvoicesGrid({
  data,
  loading,
  autoPaymentCustomerIds,
  pendingPaymentInvoiceNos = new Set(),
  balanceMap = new Map(),
  onSortChange,
  onRowDoubleClick,
  selectedIds,
  onSelectionChange,
  customButtons,
  onScrollDirectionChange
}: InvoicesGridProps) {
  const isMobile = useIsMobile();
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
    () => createInvoiceColumnDefs(autoPaymentCustomerIds, pendingPaymentInvoiceNos, balanceMap),
    [autoPaymentCustomerIds, pendingPaymentInvoiceNos, balanceMap]
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

  // Mobile view - single tap opens modal, no multiselect
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <InvoiceMobileList
          data={data}
          loading={loading}
          autoPaymentCustomerIds={autoPaymentCustomerIds}
          pendingPaymentInvoiceNos={pendingPaymentInvoiceNos}
          balanceMap={balanceMap}
          onCardClick={(invoice) => {
            onRowDoubleClick?.(invoice);
          }}
          onScrollDirectionChange={onScrollDirectionChange}
          customButtons={customButtons}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
        />
      </div>
    );
  }

  // Desktop view
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
        stateKey="invoices-grid"
        toolbar={{
          exportFileName: "faturalar",
          customButtons: customButtons ?? []
        }}
      />
    </div>
  );
}
