import { useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef, MobileFilterColumnConfig, MobileSortColumnConfig, ToolbarButtonConfig } from "@kerzz/grid";
import { InvoicePlanCard } from "./InvoicePlanCard";
import { LogBadge } from "../../../components/ui";
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

function createColumnDefs(
  lastLogDatesByPlanId?: Record<string, string>,
  onOpenLogs?: (plan: EnrichedPaymentPlan) => void
): GridColumnDef<EnrichedPaymentPlan>[] {
  return [
    {
      id: "contractNumber",
      header: "Sözleşme No",
      accessorKey: "contractNumber",
      width: 110,
      sortable: true,
      filter: { type: "input" },
      cellClassName: "font-mono",
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
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: "font-mono",
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
      filter: { type: "numeric" },
      cell: (value) => {
        const num = value as number;
        if (num === -100) return "—";
        return formatCurrency(num);
      },
      cellClassName: (value) => {
        const num = value as number;
        const classes = "font-mono text-right";
        if (num > 0) return `text-[var(--color-error)] font-semibold ${classes}`;
        return classes;
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
      id: "log",
      header: "",
      accessorKey: "_id",
      width: 44,
      align: "center",
      cell: (_, row) => (
        <LogBadge
          lastLogAt={lastLogDatesByPlanId?.[row.contractId]}
          onClick={() => onOpenLogs?.(row)}
          size="md"
        />
      ),
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
      filter: { type: "dateTree" },
      cell: (value) => formatDate(value as string),
    },
    {
      id: "editUser",
      header: "Düzenleyen",
      accessorKey: "editUser",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
    },
  ];
}

// Mobil filtre konfigürasyonu
const mobileFilterColumns: MobileFilterColumnConfig[] = [
  { id: "contractNumber", header: "Sözleşme No", type: "text", accessorKey: "contractNumber" },
  { id: "internalFirm", header: "Firma", type: "select", accessorKey: "internalFirm" },
  { id: "company", header: "Müşteri", type: "text", accessorKey: "company" },
  { id: "brand", header: "Marka", type: "text", accessorKey: "brand" },
  { id: "segment", header: "Segment", type: "select", accessorKey: "segment" },
  { id: "total", header: "Tutar", type: "number", accessorKey: "total" },
  { id: "balance", header: "Bakiye", type: "number", accessorKey: "balance" },
  { id: "invoiceNo", header: "Fatura No", type: "text", accessorKey: "invoiceNo" },
  { id: "paid", header: "Ödeme", type: "boolean", accessorKey: "paid" },
  { id: "block", header: "Blok", type: "boolean", accessorKey: "block" },
  { id: "invoiceError", header: "Hata", type: "text", accessorKey: "invoiceError" },
  { id: "payDate", header: "Plan Tarihi", type: "text", accessorKey: "payDate" },
  { id: "editDate", header: "Düzenleme", type: "text", accessorKey: "editDate" },
  { id: "editUser", header: "Düzenleyen", type: "text", accessorKey: "editUser" },
];

// Mobil sıralama konfigürasyonu
const mobileSortColumns: MobileSortColumnConfig[] = [
  { id: "contractNumber", header: "Sözleşme No", accessorKey: "contractNumber" },
  { id: "internalFirm", header: "Firma", accessorKey: "internalFirm" },
  { id: "company", header: "Müşteri", accessorKey: "company" },
  { id: "brand", header: "Marka", accessorKey: "brand" },
  { id: "segment", header: "Segment", accessorKey: "segment" },
  { id: "total", header: "Tutar", accessorKey: "total" },
  { id: "balance", header: "Bakiye", accessorKey: "balance" },
  { id: "invoiceNo", header: "Fatura No", accessorKey: "invoiceNo" },
  { id: "paid", header: "Ödeme", accessorKey: "paid" },
  { id: "block", header: "Blok", accessorKey: "block" },
  { id: "invoiceError", header: "Hata", accessorKey: "invoiceError" },
  { id: "payDate", header: "Plan Tarihi", accessorKey: "payDate" },
  { id: "editDate", header: "Düzenleme", accessorKey: "editDate" },
  { id: "editUser", header: "Düzenleyen", accessorKey: "editUser" },
];

interface ContractInvoicesGridProps {
  data: EnrichedPaymentPlan[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRowDoubleClick?: (row: EnrichedPaymentPlan) => void;
  /** Mobil scroll yönü callback'i (collapsible header ile entegrasyon) */
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
  /** Son log tarihleri map'i (planId -> ISO date string) */
  lastLogDatesByPlanId?: Record<string, string>;
  /** Log panelini açmak için callback */
  onOpenLogs?: (plan: EnrichedPaymentPlan) => void;
  /** Toolbar'da gösterilecek custom butonlar */
  toolbarCustomButtons?: ToolbarButtonConfig[];
}

export function ContractInvoicesGrid({
  data,
  loading,
  selectedIds,
  onSelectionChange,
  onRowDoubleClick,
  onScrollDirectionChange,
  lastLogDatesByPlanId,
  onOpenLogs,
  toolbarCustomButtons,
}: ContractInvoicesGridProps) {
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

  const columns = useMemo(
    () => createColumnDefs(lastLogDatesByPlanId, onOpenLogs),
    [lastLogDatesByPlanId, onOpenLogs]
  );

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
          customButtons: toolbarCustomButtons,
        }}
        mobileConfig={{
          cardRenderer: (props) => (
            <InvoicePlanCard
              plan={props.item}
              onClick={() => props.onDoubleTap()}
              selected={props.isSelected}
              onSelect={() => props.onSelect()}
              lastLogAt={lastLogDatesByPlanId?.[props.item.contractId]}
              onOpenLogs={onOpenLogs}
            />
          ),
          filterColumns: mobileFilterColumns,
          sortColumns: mobileSortColumns,
          estimatedCardHeight: 140,
          onScrollDirectionChange,
        }}
      />
    </div>
  );
}
