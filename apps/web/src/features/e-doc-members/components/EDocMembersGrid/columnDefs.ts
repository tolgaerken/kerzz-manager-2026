import type { GridColumnDef } from "@kerzz/grid";
import type { EDocMemberItem } from "../../types/eDocMember.types";
import { CONTRACT_TYPE_OPTIONS } from "../../constants/eDocMembers.constants";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
    value,
  );
};

const getContractTypeName = (typeId: string | null | undefined): string => {
  if (!typeId) return "-";
  const found = CONTRACT_TYPE_OPTIONS.find((opt) => opt.id === typeId);
  return found?.name || typeId;
};

export const eDocMemberColumnDefs: GridColumnDef<EDocMemberItem>[] = [
  {
    id: "internalFirm",
    header: "Firmamız",
    accessorKey: "internalFirm",
    width: 100,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "customerName",
    header: "Cari",
    accessorKey: "customerName",
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "erpId",
    header: "ERP ID",
    accessorKey: "erpId",
    width: 130,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
  },
  {
    id: "contractType",
    header: "Üyelik Tipi",
    accessorKey: "contractType",
    width: 100,
    sortable: true,
    cell: (value) => getContractTypeName(value as string),
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "licenseName",
    header: "Lisans",
    accessorKey: "licenseName",
    minWidth: 150,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "active",
    header: "Aktif",
    accessorKey: "active",
    width: 70,
    sortable: true,
    cell: (value) => ((value as boolean) ? "Evet" : "Hayır"),
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "desc",
    header: "Açıklama",
    accessorKey: "desc",
    minWidth: 120,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
  },
  {
    id: "taxNumber",
    header: "V.No",
    accessorKey: "taxNumber",
    width: 110,
    sortable: true,
    filter: { type: "input" },
    cell: (value) => (value as string) || "-",
    cellClassName: "font-mono text-xs",
  },
  {
    id: "creditPrice",
    header: "Kontör Fiyatı",
    accessorKey: "creditPrice",
    width: 120,
    sortable: true,
    cell: (value) => formatCurrency(value as number),
  },
  {
    id: "totalCharge",
    header: "Alınan Kontör",
    accessorKey: "totalCharge",
    width: 110,
    sortable: true,
    cell: (value) => formatNumber(value as number),
    cellClassName: () => "text-[var(--color-success)]",
  },
  {
    id: "totalConsumption",
    header: "Harcanan Kontör",
    accessorKey: "totalConsumption",
    width: 120,
    sortable: true,
    cell: (value) => formatNumber(value as number),
    cellClassName: () => "text-[var(--color-error)]",
  },
  {
    id: "monthlyAverage",
    header: "Aylık Ortalama",
    accessorKey: "monthlyAverage",
    width: 120,
    sortable: true,
    cell: (value) => formatNumber(value as number),
    cellClassName: () => "text-[var(--color-info)]",
  },
  {
    id: "creditBalance",
    header: "Kalan Kontör",
    accessorKey: "creditBalance",
    width: 180,
    sortable: true,
    // CreditBalanceCell renderer is applied in the Grid component
  },
  {
    id: "createdAt",
    header: "Oluşturma",
    accessorKey: "createdAt",
    width: 100,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
  {
    id: "updatedAt",
    header: "Güncelleme",
    accessorKey: "updatedAt",
    width: 100,
    sortable: true,
    cell: (value) => formatDate(value as string),
  },
];
