import type { GridColumnDef } from "@kerzz/grid";
import type { License } from "../../types";
import type { CustomerLookupItem } from "../../../lookup";
import { getTypeName, getCompanyTypeName, getCategoryName } from "../../constants/licenses.constants";

/** Tarih formatlama */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/** Son online durumu için renk */
const getOnlineStatusClass = (lastOnline: string | null): string => {
  if (!lastOnline) return "text-gray-400";

  const lastOnlineDate = new Date(lastOnline);
  const now = new Date();
  const diffHours = (now.getTime() - lastOnlineDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) return "text-green-500 font-semibold";
  if (diffHours < 24) return "text-yellow-500";
  if (diffHours < 168) return "text-orange-500";
  return "text-red-500";
};

export const createLicenseColumnDefs = (customerMap: Map<string, CustomerLookupItem>): GridColumnDef<License>[] => [
  {
    id: "licenseId",
    header: "ID",
    accessorKey: "licenseId",
    width: 90,
    sortable: true,
    pinned: "left",
    cellClassName: "font-mono"
  },
  {
    id: "brandName",
    header: "Tabela Adı",
    accessorKey: "brandName",
    width: 200,
    minWidth: 200,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "customerName",
    header: "Müşteri",
    accessorFn: (row) => {
      if (row.customerId) {
        const trimmedId = row.customerId.toString().trim();
        const customer = customerMap.get(trimmedId);
        return customer?.name || customer?.companyName || row.customerName || "-";
      }
      return row.customerName || "-";
    },
    width: 180,
    minWidth: 150,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "type",
    header: "Tip",
    accessorKey: "type",
    width: 120,
    sortable: true,
    valueFormatter: (value) => getTypeName((value as string) || ""),
    cellClassName: (value) => {
      switch (value) {
        case "kerzz-pos":
          return "text-blue-500";
        case "orwi-pos":
          return "text-purple-500";
        case "kerzz-cloud":
          return "text-green-500";
        default:
          return "";
      }
    },
    filter: { type: "dropdown" }
  },
  {
    id: "companyType",
    header: "Şirket Tipi",
    accessorKey: "companyType",
    width: 110,
    sortable: true,
    valueFormatter: (value) => getCompanyTypeName((value as string) || ""),
    filter: { type: "dropdown" }
  },
  {
    id: "city",
    header: "Şehir",
    accessorFn: (row) => row.address?.city || "-",
    width: 120,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "phone",
    header: "Telefon",
    accessorKey: "phone",
    width: 140,
    sortable: false
  },
  {
    id: "active",
    header: "Aktif",
    accessorKey: "active",
    width: 80,
    sortable: true,
    align: "center",
    cell: (value) => (value ? "✓" : "✗"),
    cellClassName: (value) =>
      value ? "text-green-500 text-center" : "text-red-500 text-center",
    filter: { type: "dropdown" }
  },
  {
    id: "block",
    header: "Bloke",
    accessorKey: "block",
    width: 80,
    sortable: true,
    align: "center",
    cell: (value) => (value ? "⛔" : ""),
    cellClassName: "text-center",
    filter: { type: "dropdown" }
  },
  {
    id: "haveContract",
    header: "Kontrat",
    accessorKey: "haveContract",
    width: 90,
    sortable: true,
    align: "center",
    cell: (value) => (value ? "✓" : "✗"),
    cellClassName: (value) =>
      value ? "text-green-500 text-center" : "text-gray-400 text-center",
    filter: { type: "dropdown" }
  },
  {
    id: "lastOnline",
    header: "Son Online",
    accessorKey: "lastOnline",
    width: 150,
    sortable: true,
    valueFormatter: (value) => formatDate(value as string | null),
    cellClassName: (_value, row) => getOnlineStatusClass(row.lastOnline)
  },
  {
    id: "lastVersion",
    header: "Versiyon",
    accessorKey: "lastVersion",
    width: 100,
    sortable: true,
    cellClassName: "font-mono text-xs"
  },
  {
    id: "licenseItems",
    header: "Modüller",
    accessorFn: (row) => row.licenseItemsCount ?? row.licenseItems?.length ?? 0,
    width: 90,
    sortable: false,
    align: "center",
    cellClassName: "text-center"
  },
  {
    id: "saasItems",
    header: "SaaS",
    accessorFn: (row) => row.saasItemsCount ?? row.saasItems?.length ?? 0,
    width: 80,
    sortable: false,
    align: "center",
    cellClassName: "text-center"
  },
  {
    id: "category",
    header: "Kategori",
    accessorKey: "category",
    width: 140,
    sortable: true,
    valueFormatter: (value) => getCategoryName((value as string) || "") || "-",
    filter: { type: "dropdown" }
  }
];
