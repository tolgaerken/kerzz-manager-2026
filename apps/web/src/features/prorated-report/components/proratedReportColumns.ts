import type { GridColumnDef } from "@kerzz/grid";
import type { ProratedPlan } from "../types/prorated-report.types";

const formatCurrency = (value: unknown): string => {
  if (value == null) return "";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value as number);
};

const formatDate = (value: unknown): string => {
  if (!value) return "";
  return new Date(value as string).toLocaleDateString("tr-TR");
};

export const proratedReportColumns: GridColumnDef<ProratedPlan>[] = [
  {
    id: "company",
    accessorKey: "company",
    header: "Firma",
    width: 200,
    minWidth: 150,
    filter: { type: "dropdown" },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Marka",
    width: 180,
    minWidth: 120,
    filter: { type: "dropdown" },
  },
  {
    id: "contractNumber",
    accessorKey: "contractNumber",
    header: "Kontrat No",
    width: 100,
    align: "right",
    filter: { type: "dropdown" },
  },
  {
    id: "description",
    accessorKey: "list",
    header: "Açıklama",
    width: 300,
    minWidth: 200,
    cell: (value) => {
      const list = value as ProratedPlan["list"];
      return list?.[0]?.description || "";
    },
  },
  {
    id: "proratedStartDate",
    accessorKey: "proratedStartDate",
    header: "Başlangıç",
    width: 110,
    filter: { type: "dropdown" },
    valueFormatter: formatDate,
  },
  {
    id: "proratedDays",
    accessorKey: "proratedDays",
    header: "Gün",
    width: 70,
    align: "right",
    footer: {
      aggregate: "avg",
      format: (value) => (value != null ? Math.round(value as number).toString() : ""),
    },
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Tutar",
    width: 120,
    align: "right",
    filter: { type: "dropdown" },
    valueFormatter: formatCurrency,
    footer: {
      aggregate: "sum",
      format: (value) => formatCurrency(value),
    },
  },
  {
    id: "paid",
    accessorKey: "paid",
    header: "Ödendi",
    width: 80,
    filter: { type: "dropdown" },
    cell: (value) => (value ? "✓" : "✗"),
  },
  {
    id: "invoiceNo",
    accessorKey: "invoiceNo",
    header: "Fatura No",
    width: 140,
    filter: { type: "dropdown" },
    cell: (value) => (value ? String(value) : "-"),
  },
  {
    id: "internalFirm",
    accessorKey: "internalFirm",
    header: "Dahili Firma",
    width: 120,
    filter: { type: "dropdown" },
  },
  {
    id: "payDate",
    accessorKey: "payDate",
    header: "Ödeme Tarihi",
    width: 110,
    filter: { type: "dropdown" },
    valueFormatter: formatDate,
  },
];
