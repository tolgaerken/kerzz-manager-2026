import type { GridColumnDef } from "@kerzz/grid";
import type { Offer } from "../../types/offer.types";
import { StatusBadge } from "../../../pipeline";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const offerColumnDefs: GridColumnDef<Offer>[] = [
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
    cell: (value) => (value as string) || "-",
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
    header: "Teklif Tarihi",
    accessorKey: "saleDate",
    width: 120,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "validUntil",
    header: "Geçerlilik Tarihi",
    accessorKey: "validUntil",
    width: 130,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "status",
    header: "Durum",
    accessorKey: "status",
    width: 140,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value) => StatusBadge({ status: value as string }),
  },
  {
    id: "internalFirm",
    header: "Firma",
    accessorKey: "internalFirm",
    width: 100,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "createdAt",
    header: "Oluşturma",
    accessorKey: "createdAt",
    width: 110,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
];
