import type { GridColumnDef } from "@kerzz/grid";
import type { Sale, ApprovalStatus } from "../../types/sale.types";
import { StatusBadge } from "../../../pipeline";
import { SALES_CONSTANTS } from "../../constants/sales.constants";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);

export const salesColumnDefs: GridColumnDef<Sale>[] = [
  {
    id: "no",
    header: "No",
    accessorKey: "no",
    width: 80,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs font-semibold",
    cell: (value) => (value as number) || "-",
  },
  {
    id: "pipelineRef",
    header: "Referans",
    accessorKey: "pipelineRef",
    width: 130,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
  },
  {
    id: "customerName",
    header: "Müşteri",
    accessorKey: "customerName",
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "sellerName",
    header: "Satıcı",
    accessorKey: "sellerName",
    minWidth: 150,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "saleDate",
    header: "Satış Tarihi",
    accessorKey: "saleDate",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "implementDate",
    header: "Uygulama Tarihi",
    accessorKey: "implementDate",
    width: 130,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "grandTotal",
    header: "Genel Toplam",
    accessorKey: "grandTotal",
    width: 140,
    sortable: true,
    align: "right",
    cellClassName: "font-mono text-xs font-semibold",
    cell: (value) => formatCurrency((value as number) || 0),
    footer: {
      aggregate: "sum",
      format: formatCurrency,
    },
  },
  {
    id: "hardwareTotal",
    header: "Donanım",
    accessorKey: "hardwareTotal",
    width: 130,
    sortable: true,
    align: "right",
    visible: false,
    cellClassName: "font-mono text-xs",
    cell: (value) => formatCurrency((value as number) || 0),
    footer: {
      aggregate: "sum",
      format: formatCurrency,
    },
  },
  {
    id: "softwareTotal",
    header: "Yazılım",
    accessorKey: "softwareTotal",
    width: 130,
    sortable: true,
    align: "right",
    visible: false,
    cellClassName: "font-mono text-xs",
    cell: (value) => formatCurrency((value as number) || 0),
    footer: {
      aggregate: "sum",
      format: formatCurrency,
    },
  },
  {
    id: "saasTotal",
    header: "SaaS",
    accessorKey: "saasTotal",
    width: 130,
    sortable: true,
    align: "right",
    visible: false,
    cellClassName: "font-mono text-xs",
    cell: (value) => formatCurrency((value as number) || 0),
    footer: {
      aggregate: "sum",
      format: formatCurrency,
    },
  },
  {
    id: "status",
    header: "Durum",
    accessorKey: "status",
    width: 160,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value) => StatusBadge({ status: value as string }),
  },
  {
    id: "approvalStatus",
    header: "Onay Durumu",
    accessorKey: "approvalStatus",
    width: 130,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value) => {
      const status = (value as ApprovalStatus) || "none";
      const config = SALES_CONSTANTS.APPROVAL_STATUS_CONFIG[status];
      return config?.label || "-";
    },
    cellClassName: (value: unknown) => {
      const status = (value as ApprovalStatus) || "none";
      const config = SALES_CONSTANTS.APPROVAL_STATUS_CONFIG[status];
      return `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config?.className || ""}`;
    },
  },
  {
    id: "internalFirm",
    header: "Firma",
    accessorKey: "internalFirm",
    width: 120,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "createdAt",
    header: "Oluşturulma",
    accessorKey: "createdAt",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
];
