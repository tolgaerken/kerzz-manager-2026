import type { GridColumnDef } from "@kerzz/grid";
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

export const paymentPlanColumnDefs: GridColumnDef<PaymentPlanItem>[] = [
  {
    id: "paid",
    header: "Durum",
    accessorKey: "paid",
    width: 80,
    cell: (value) => (value ? "✓ Ödendi" : "✗ Ödenmedi"),
    cellClassName: (_value: unknown, row: PaymentPlanItem) =>
      row.paid ? "text-green-600 font-bold" : "text-red-500",
    footer: { aggregate: "count", label: "Adet:" },
  },
  {
    id: "total",
    header: "Tutar",
    accessorKey: "total",
    width: 120,
    cell: (value) => formatCurrency((value as number) ?? 0),
    cellClassName: "font-mono font-medium",
    footer: {
      aggregate: "sum",
      format: (v) => formatCurrency(v),
    },
  },
  {
    id: "invoiceTotal",
    header: "Fatura",
    accessorKey: "invoiceTotal",
    width: 120,
    cell: (value) => formatCurrency((value as number) ?? 0),
    cellClassName: "font-mono",
    footer: {
      aggregate: "sum",
      format: (v) => formatCurrency(v),
    },
  },
  {
    id: "invoiceNo",
    header: "Fatura No",
    accessorKey: "invoiceNo",
    width: 130,
    cellClassName: "font-mono text-xs",
  },
  {
    id: "invoiceDate",
    header: "Fatura Tarihi",
    accessorKey: "invoiceDate",
    width: 120,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "paymentDate",
    header: "Ödeme Tarihi",
    accessorKey: "paymentDate",
    width: 120,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "otoPaymentAttempt",
    header: "Son Deneme",
    accessorKey: "otoPaymentAttempt",
    width: 120,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "dueDate",
    header: "Vade",
    accessorKey: "dueDate",
    width: 110,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "onlinePaymentError",
    header: "Hata",
    accessorKey: "onlinePaymentError",
    width: 200,
    cellClassName: "text-red-500 text-xs",
  },
];
