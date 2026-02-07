import type { GridColumnDef } from "@kerzz/grid";
import type { AutoPaymentTokenItem } from "../../types/automatedPayment.types";

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

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

export const tokenColumnDefs: GridColumnDef<AutoPaymentTokenItem>[] = [
  {
    id: "companyId",
    header: "Firma",
    accessorKey: "companyId",
    width: 100,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    footer: { aggregate: "distinctCount", label: "Firma:" },
  },
  {
    id: "createDate",
    header: "Tarih",
    accessorKey: "createDate",
    width: 150,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "customerName",
    header: "Müşteri",
    accessorKey: "customerName",
    minWidth: 180,
    sortable: true,
    filter: { type: "input" },
    footer: { aggregate: "count", label: "Toplam:" },
  },
  {
    id: "email",
    header: "E-posta",
    accessorKey: "email",
    minWidth: 180,
    sortable: true,
    filter: { type: "input" },
  },
  {
    id: "customerId",
    header: "Müşteri ID",
    accessorKey: "customerId",
    width: 130,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
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
    id: "balance",
    header: "Bakiye",
    accessorKey: "balance",
    width: 140,
    sortable: true,
    filter: {
      type: "input",
      conditions: ["equals", "greaterThan", "lessThan", "between"],
    },
    cell: (value) => formatCurrency(value as number),
    cellClassName: (_value: unknown, row: AutoPaymentTokenItem) => {
      const val = row.balance;
      if (val > 0) return "font-mono text-red-600 font-semibold";
      if (val < 0) return "font-mono text-green-600 font-semibold";
      return "font-mono";
    },
    footer: {
      aggregate: "sum",
      format: (v) => formatCurrency(v),
    },
  },
  {
    id: "source",
    header: "Kaynak",
    accessorKey: "source",
    width: 80,
    sortable: true,
  },
];
