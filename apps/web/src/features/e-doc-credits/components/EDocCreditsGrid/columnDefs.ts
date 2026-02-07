import type { GridColumnDef } from "@kerzz/grid";
import type { EDocCreditItem } from "../../types/eDocCredit.types";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (
  value: number | null | undefined,
  currency?: string
): string => {
  if (value == null) return "-";
  const currencyCode =
    currency === "usd" ? "USD" : currency === "eur" ? "EUR" : "TRY";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(value);
};

const currencyLabel = (currency: string | null | undefined): string => {
  if (!currency) return "-";
  const map: Record<string, string> = { tl: "TL", usd: "USD", eur: "EUR" };
  return map[currency] || currency.toUpperCase();
};

export const eDocCreditColumnDefs: GridColumnDef<EDocCreditItem>[] = [
  {
    id: "date",
    header: "Tarih",
    accessorKey: "date",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "internalFirm",
    header: "Firma",
    accessorKey: "internalFirm",
    width: 120,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "erpId",
    header: "Müşteri (ERP)",
    accessorKey: "erpId",
    minWidth: 140,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
  },
  {
    id: "customerName",
    header: "Müşteri Adı",
    accessorKey: "customerName",
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "price",
    header: "Birim Fiyat",
    accessorKey: "price",
    width: 130,
    sortable: true,
    cell: (value, row) =>
      formatCurrency(value as number, (row as EDocCreditItem).currency),
  },
  {
    id: "count",
    header: "Adet",
    accessorKey: "count",
    width: 80,
    sortable: true,
    footer: { aggregate: "sum", label: "Toplam:" },
  },
  {
    id: "total",
    header: "Toplam",
    accessorKey: "total",
    width: 140,
    sortable: true,
    cell: (value, row) =>
      formatCurrency(value as number, (row as EDocCreditItem).currency),
    cellClassName: "font-semibold",
    footer: {
      aggregate: "sum",
      format: (v) => formatCurrency(v),
    },
  },
  {
    id: "currency",
    header: "Para Birimi",
    accessorKey: "currency",
    width: 100,
    sortable: true,
    cell: (value) => currencyLabel(value as string),
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "invoiceNumber",
    header: "Fatura No",
    accessorKey: "invoiceNumber",
    minWidth: 140,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
    cellClassName: (_value: unknown) => {
      const val = _value as string;
      return val
        ? "text-green-600 dark:text-green-400 font-medium"
        : "text-[var(--color-muted-foreground)]";
    },
  },
  {
    id: "invoiceDate",
    header: "Fatura Tarihi",
    accessorKey: "invoiceDate",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "grandTotal",
    header: "Fatura Toplam",
    accessorKey: "grandTotal",
    width: 140,
    sortable: true,
    cell: (value, row) =>
      (value as number) > 0
        ? formatCurrency(value as number, (row as EDocCreditItem).currency)
        : "-",
    cellClassName: (_value: unknown) => {
      const val = _value as number;
      return val > 0 ? "font-semibold text-green-600 dark:text-green-400" : "";
    },
  },
];
