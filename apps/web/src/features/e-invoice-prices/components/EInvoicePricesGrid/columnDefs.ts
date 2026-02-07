import type { GridColumnDef } from "@kerzz/grid";
import type { EInvoicePriceItem } from "../../types/eInvoicePrice.types";

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return `%${value.toFixed(2)}`;
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const eInvoicePriceColumnDefs: GridColumnDef<EInvoicePriceItem>[] = [
  {
    id: "sequence",
    header: "Sıra",
    accessorKey: "sequence",
    width: 80,
    sortable: true,
  },
  {
    id: "name",
    header: "Ürün Adı",
    accessorKey: "name",
    minWidth: 220,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-medium",
  },
  {
    id: "erpId",
    header: "ERP ID",
    accessorKey: "erpId",
    width: 120,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
  },
  {
    id: "quantity",
    header: "Miktar",
    accessorKey: "quantity",
    width: 90,
    sortable: true,
    footer: { aggregate: "sum", label: "Toplam:" },
  },
  {
    id: "unitPrice",
    header: "Birim Fiyat",
    accessorKey: "unitPrice",
    width: 130,
    sortable: true,
    cell: (value) => formatCurrency(value as number),
  },
  {
    id: "discountRate",
    header: "İndirim (%)",
    accessorKey: "discountRate",
    width: 110,
    sortable: true,
    cell: (value) => formatPercent(value as number),
  },
  {
    id: "totalPrice",
    header: "Toplam Fiyat",
    accessorKey: "totalPrice",
    width: 140,
    sortable: true,
    cell: (value) => formatCurrency(value as number),
    cellClassName: "font-semibold",
    footer: {
      aggregate: "sum",
      format: (v) => formatCurrency(v),
    },
  },
  {
    id: "isCredit",
    header: "Kredi",
    accessorKey: "isCredit",
    width: 80,
    sortable: true,
    cell: (value) => ((value as boolean) ? "Evet" : "Hayır"),
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "customerErpId",
    header: "Müşteri ERP ID",
    accessorKey: "customerErpId",
    width: 140,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "Master",
    cellClassName: (_value: unknown) => {
      const val = _value as string;
      return val
        ? "font-mono text-xs"
        : "text-[var(--color-info)] font-medium";
    },
  },
  {
    id: "createdAt",
    header: "Oluşturma",
    accessorKey: "createdAt",
    width: 150,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "updatedAt",
    header: "Güncelleme",
    accessorKey: "updatedAt",
    width: 150,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
];
