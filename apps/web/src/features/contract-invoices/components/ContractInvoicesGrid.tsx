import { useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { InvoicePlanMobileList } from "./InvoicePlanMobileList";
import type { EnrichedPaymentPlan } from "../types";
import { SEGMENT_COLORS } from "../types";

// Para formati
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

// Tarih formati
const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Segment badge
function SegmentBadge({ segment }: { segment: string }) {
  if (!segment) return null;
  const bg = SEGMENT_COLORS[segment] || "transparent";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize"
      style={{ backgroundColor: bg }}
    >
      {segment}
    </span>
  );
}

function createColumnDefs(): GridColumnDef<EnrichedPaymentPlan>[] {
  return [
    {
      id: "contractNumber",
      header: "Sözleşme No",
      accessorKey: "contractNumber",
      width: 110,
      sortable: true,
      filter: { type: "input" },
    },
    {
      id: "internalFirm",
      header: "Firma",
      accessorKey: "internalFirm",
      width: 90,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "company",
      header: "Müşteri",
      accessorKey: "company",
      minWidth: 200,
      sortable: true,
      filter: { type: "input" },
      footer: { aggregate: "count", label: "" },
    },
    {
      id: "brand",
      header: "Marka",
      accessorKey: "brand",
      width: 140,
      sortable: true,
      filter: { type: "input" },
    },
    {
      id: "segment",
      header: "Segment",
      accessorKey: "segment",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      cell: (value) => <SegmentBadge segment={value as string} />,
    },
    {
      id: "total",
      header: "Tutar",
      accessorKey: "total",
      width: 120,
      sortable: true,
      align: "right",
      cell: (value) => formatCurrency(value as number),
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v),
      },
    },
    {
      id: "balance",
      header: "Bakiye",
      accessorKey: "balance",
      width: 120,
      sortable: true,
      align: "right",
      cell: (value) => {
        const num = value as number;
        if (num === -100) return "—";
        return formatCurrency(num);
      },
      cellClassName: (value) => {
        const num = value as number;
        if (num > 0) return "text-[var(--color-error)] font-semibold text-right";
        return "text-right";
      },
    },
    {
      id: "invoiceNo",
      header: "Fatura No",
      accessorKey: "invoiceNo",
      width: 140,
      sortable: true,
      filter: { type: "input" },
    },
    {
      id: "paid",
      header: "Ödeme",
      accessorKey: "paid",
      width: 80,
      sortable: true,
      align: "center",
      filter: { type: "dropdown", showCounts: true },
      cell: (value) => (value ? "✓" : "✗"),
      cellClassName: (value) =>
        value
          ? "text-[var(--color-success)] font-bold text-center"
          : "text-[var(--color-error)] text-center",
    },
    {
      id: "block",
      header: "Blok",
      accessorKey: "block",
      width: 70,
      sortable: true,
      align: "center",
      filter: { type: "dropdown", showCounts: true },
      cell: (value) => (value ? "🔒" : ""),
    },
    {
      id: "invoiceError",
      header: "Hata",
      accessorKey: "invoiceError",
      width: 120,
      sortable: true,
      filter: { type: "input" },
      cellClassName: "text-[var(--color-error)] text-xs",
    },
    {
      id: "payDate",
      header: "Plan Tarihi",
      accessorKey: "payDate",
      width: 110,
      sortable: true,
      filter: { type: "dateTree" },
      cell: (value) => formatDate(value as string),
    },
    {
      id: "editDate",
      header: "Düzenleme",
      accessorKey: "editDate",
      width: 110,
      sortable: true,
      cell: (value) => formatDate(value as string),
    },
    {
      id: "editUser",
      header: "Düzenleyen",
      accessorKey: "editUser",
      width: 100,
      sortable: true,
    },
  ];
}

interface ContractInvoicesGridProps {
  data: EnrichedPaymentPlan[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowDoubleClick?: (row: EnrichedPaymentPlan) => void;
  /** Mobil scroll yönü callback'i (collapsible header ile entegrasyon) */
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export function ContractInvoicesGrid({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onRowDoubleClick,
  onScrollDirectionChange,
}: ContractInvoicesGridProps) {
  const isMobile = useIsMobile();
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

  // Mobil görünüm
  if (isMobile) {
    return (
      <div ref={containerRef} className="h-full w-full flex-1 flex flex-col">
        <InvoicePlanMobileList
          data={data}
          loading={loading}
          selectedIds={selectedIds}
          onCardClick={(plan) => onRowDoubleClick?.(plan)}
          onSelectionChange={onSelectionChange}
          onScrollDirectionChange={onScrollDirectionChange}
        />
      </div>
    );
  }

  // Desktop görünüm
  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<EnrichedPaymentPlan>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row.id}
        onRowDoubleClick={onRowDoubleClick}
        selectionMode="multiple"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        stateKey="contract-invoices-grid"
        toolbar={{
          exportFileName: "sozlesme_faturalari",
        }}
      />
    </div>
  );
}
