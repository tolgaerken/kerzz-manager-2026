import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { License } from "../../types";
import { getTypeName, getCompanyTypeName, getCategoryName } from "../../constants/licenses.constants";

// Tarih formatlama
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

// Son online durumu için renk
const getOnlineStatusClass = (lastOnline: string | null): string => {
  if (!lastOnline) return "text-gray-400";

  const lastOnlineDate = new Date(lastOnline);
  const now = new Date();
  const diffHours = (now.getTime() - lastOnlineDate.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) return "text-green-500 font-semibold";
  if (diffHours < 24) return "text-yellow-500";
  if (diffHours < 168) return "text-orange-500"; // 1 hafta
  return "text-red-500";
};

export const licenseColumnDefs: ColDef<License>[] = [
  {
    field: "licenseId",
    headerName: "ID",
    width: 90,
    sortable: true,
    pinned: "left",
    cellClass: "font-mono"
  },
  {
    field: "brandName",
    headerName: "Tabela Adı",
    flex: 1.5,
    minWidth: 200,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "customerName",
    headerName: "Müşteri",
    flex: 1.2,
    minWidth: 150,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "type",
    headerName: "Tip",
    width: 120,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<License>) =>
      getTypeName(params.value || ""),
    cellClass: (params) => {
      switch (params.value) {
        case "kerzz-pos":
          return "text-blue-500";
        case "orwi-pos":
          return "text-purple-500";
        case "kerzz-cloud":
          return "text-green-500";
        default:
          return "";
      }
    }
  },
  {
    field: "companyType",
    headerName: "Şirket Tipi",
    width: 110,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<License>) =>
      getCompanyTypeName(params.value || "")
  },
  {
    field: "address.city",
    headerName: "Şehir",
    width: 120,
    sortable: true,
    valueGetter: (params) => params.data?.address?.city || "-"
  },
  {
    field: "phone",
    headerName: "Telefon",
    width: 140,
    sortable: false
  },
  {
    field: "active",
    headerName: "Aktif",
    width: 80,
    sortable: true,
    cellRenderer: (params: { value: boolean }) => {
      return params.value ? "✓" : "✗";
    },
    cellClass: (params) => (params.value ? "text-green-500 text-center" : "text-red-500 text-center")
  },
  {
    field: "block",
    headerName: "Bloke",
    width: 80,
    sortable: true,
    cellRenderer: (params: { value: boolean }) => {
      return params.value ? "⛔" : "";
    },
    cellClass: "text-center"
  },
  {
    field: "haveContract",
    headerName: "Kontrat",
    width: 90,
    sortable: true,
    cellRenderer: (params: { value: boolean }) => {
      return params.value ? "✓" : "✗";
    },
    cellClass: (params) => (params.value ? "text-green-500 text-center" : "text-gray-400 text-center")
  },
  {
    field: "lastOnline",
    headerName: "Son Online",
    width: 150,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<License>) => formatDate(params.value),
    cellClass: (params) => getOnlineStatusClass(params.data?.lastOnline || null)
  },
  {
    field: "lastVersion",
    headerName: "Versiyon",
    width: 100,
    sortable: true,
    cellClass: "font-mono text-xs"
  },
  {
    field: "licenseItems",
    headerName: "Modüller",
    width: 90,
    sortable: false,
    valueGetter: (params) => params.data?.licenseItems?.length || 0,
    cellClass: "text-center"
  },
  {
    field: "saasItems",
    headerName: "SaaS",
    width: 80,
    sortable: false,
    valueGetter: (params) => params.data?.saasItems?.length || 0,
    cellClass: "text-center"
  },
  {
    field: "category",
    headerName: "Kategori",
    width: 140,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<License>) =>
      getCategoryName(params.value || "") || "-"
  }
];
