import type { ColDef } from "ag-grid-community";
import type { QueueInvoiceItem } from "../../types";

const currencyFormatter = (params: { value: number }) => {
  if (params.value == null) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(params.value);
};

export const invoiceQueueColumnDefs: ColDef<QueueInvoiceItem>[] = [
  {
    field: "invoiceNumber",
    headerName: "Fatura No",
    width: 140,
    cellClass: "font-mono",
  },
  {
    headerName: "Müşteri",
    flex: 1,
    minWidth: 180,
    valueGetter: (params) => {
      const c = params.data?.customer;
      return c?.companyName || c?.name || "";
    },
  },
  {
    field: "grandTotal",
    headerName: "Tutar",
    width: 130,
    valueFormatter: currencyFormatter,
    cellClass: "text-right",
  },
  {
    field: "dueDate",
    headerName: "Son Ödeme",
    width: 120,
  },
  {
    field: "overdueDays",
    headerName: "Geciken Gün",
    width: 110,
    cellClass: (params) =>
      params.value > 0 ? "text-red-600 font-medium" : "text-[var(--color-muted)]",
  },
  {
    field: "lastNotify",
    headerName: "Son Bildirim",
    width: 120,
    valueFormatter: (params) => params.value ?? "—",
    cellClass: "text-[var(--color-muted)]",
  },
  {
    field: "notifyCount",
    headerName: "Bildirim Sayısı",
    width: 120,
  },
];
