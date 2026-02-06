import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { PaymentPlanItem } from "../../types/automatedPayment.types";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(value);
};

export const paymentPlanColumnDefs: ColDef<PaymentPlanItem>[] = [
  {
    field: "paid",
    headerName: "Ödendi",
    width: 80,
    cellRenderer: (params: { value: boolean }) =>
      params.value
        ? '<span class="text-green-600 font-bold">✓</span>'
        : '<span class="text-red-500">✗</span>',
  },
  {
    field: "total",
    headerName: "Tutar",
    width: 110,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatCurrency(params.value ?? 0),
    cellClass: "font-medium",
  },
  {
    field: "invoiceTotal",
    headerName: "Fatura",
    width: 110,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatCurrency(params.value ?? 0),
  },
  {
    field: "invoiceDate",
    headerName: "Fatura Tarihi",
    width: 110,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatDate(params.value),
  },
  {
    field: "paymentDate",
    headerName: "Ödeme Tarihi",
    width: 110,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatDate(params.value),
  },
  {
    field: "otoPaymentAttempt",
    headerName: "Son Deneme",
    width: 110,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatDate(params.value),
  },
  {
    field: "dueDate",
    headerName: "Vade",
    width: 100,
    valueFormatter: (params: ValueFormatterParams<PaymentPlanItem>) =>
      formatDate(params.value),
  },
  {
    field: "onlinePaymentError",
    headerName: "Hata",
    flex: 1,
    minWidth: 120,
    cellClass: "text-red-500 text-xs",
  },
];
