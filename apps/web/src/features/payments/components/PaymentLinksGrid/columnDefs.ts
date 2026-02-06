import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { PaymentLinkItem } from "../../types/payment.types";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(value);
};

const getStatusBadgeClass = (status: string): string => {
  const s = (status || "").toLowerCase();
  if (s.includes("success") || s === "success") return "bg-green-500/20 text-green-600 dark:text-green-400";
  if (s.includes("fail") || s === "failed") return "bg-red-500/20 text-red-600 dark:text-red-400";
  return "bg-amber-500/20 text-amber-600 dark:text-amber-400";
};

export const paymentLinkColumnDefs: ColDef<PaymentLinkItem>[] = [
  {
    field: "createDate",
    headerName: "Tarih",
    width: 150,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<PaymentLinkItem>) =>
      formatDate(params.value)
  },
  {
    field: "customerName",
    headerName: "Müşteri",
    flex: 1.2,
    minWidth: 150,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "email",
    headerName: "E-posta",
    flex: 1.2,
    minWidth: 180,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "amount",
    headerName: "Tutar",
    width: 120,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<PaymentLinkItem>) =>
      formatCurrency(params.value ?? 0),
    cellClass: "font-medium"
  },
  {
    field: "status",
    headerName: "Durum",
    width: 120,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<PaymentLinkItem>) => {
      const status = (params.value as string) || "";
      if (status === "success") return "Başarılı";
      if (status === "failed" || status.toLowerCase().includes("fail")) return "Başarısız";
      return "Beklemede";
    },
    cellClass: (params) => getStatusBadgeClass((params.value as string) || "")
  },
  {
    field: "staffName",
    headerName: "Personel",
    width: 120,
    sortable: true
  },
  {
    field: "linkId",
    headerName: "Link ID",
    width: 200,
    sortable: true,
    cellClass: "font-mono text-xs"
  }
];
