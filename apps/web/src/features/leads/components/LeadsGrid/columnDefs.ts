import type { GridColumnDef } from "@kerzz/grid";
import type { Lead } from "../../types/lead.types";

const STATUS_LABEL_MAP: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  qualified: "Nitelikli",
  unqualified: "Niteliksiz",
  converted: "Dönüştürüldü",
  lost: "Kaybedildi",
};

const PRIORITY_LABEL_MAP: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
};

const STATUS_CLASS_MAP: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  contacted:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  qualified:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  unqualified:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  converted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const PRIORITY_CLASS_MAP: Record<string, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  medium:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const formatCurrency = (
  value: number | null | undefined,
  currency?: string,
): string => {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    minimumFractionDigits: 2,
  }).format(value);
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

export const leadColumnDefs: GridColumnDef<Lead>[] = [
  {
    id: "pipelineRef",
    header: "Referans",
    accessorKey: "pipelineRef",
    width: 120,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-mono text-xs",
  },
  {
    id: "contactName",
    header: "İletişim Adı",
    accessorKey: "contactName",
    minWidth: 180,
    sortable: true,
    filter: { type: "input" },
    cellClassName: "font-medium",
  },
  {
    id: "companyName",
    header: "Firma Adı",
    accessorKey: "companyName",
    minWidth: 180,
    sortable: true,
    filter: { type: "input" },
  },
  {
    id: "contactPhone",
    header: "Telefon",
    accessorKey: "contactPhone",
    width: 140,
    sortable: true,
    cellClassName: "font-mono text-xs",
  },
  {
    id: "contactEmail",
    header: "E-posta",
    accessorKey: "contactEmail",
    minWidth: 200,
    sortable: true,
    filter: { type: "input" },
  },
  {
    id: "source",
    header: "Kaynak",
    accessorKey: "source",
    width: 120,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "status",
    header: "Durum",
    accessorKey: "status",
    width: 150,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value: unknown) => {
      const status = value as string;
      const label = STATUS_LABEL_MAP[status] || status;
      const classes = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.new;
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}">${label}</span>`;
    },
    enableHtml: true,
  },
  {
    id: "priority",
    header: "Öncelik",
    accessorKey: "priority",
    width: 110,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
    cell: (value: unknown) => {
      const priority = value as string;
      const label = PRIORITY_LABEL_MAP[priority] || priority;
      const classes =
        PRIORITY_CLASS_MAP[priority] || PRIORITY_CLASS_MAP.medium;
      return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}">${label}</span>`;
    },
    enableHtml: true,
  },
  {
    id: "estimatedValue",
    header: "Tahmini Değer",
    accessorKey: "estimatedValue",
    width: 150,
    sortable: true,
    cell: (value: unknown, row: Lead) =>
      formatCurrency(value as number, row.currency),
    cellClassName: "font-semibold",
  },
  {
    id: "assignedUserName",
    header: "Atanan Kişi",
    accessorKey: "assignedUserName",
    width: 150,
    sortable: true,
    filter: { type: "dropdown", showCounts: true },
  },
  {
    id: "createdAt",
    header: "Oluşturma",
    accessorKey: "createdAt",
    width: 160,
    sortable: true,
    cell: (value: unknown) => formatDate(value as string),
  },
];
