import type { ColDef } from "ag-grid-community";
import type { SoftwareProduct } from "../../types";
import { getCurrencyName, getProductTypeName } from "../../constants/software-products.constants";

export const softwareProductColumnDefs: ColDef<SoftwareProduct>[] = [
  {
    field: "erpId",
    headerName: "ERP Kodu",
    width: 100,
    pinned: "left"
  },
  {
    field: "name",
    headerName: "Ürün Adı",
    flex: 1,
    minWidth: 250
  },
  {
    field: "friendlyName",
    headerName: "Kullanıcı Adı",
    flex: 1,
    minWidth: 200
  },
  {
    field: "type",
    headerName: "Tip",
    width: 100,
    valueFormatter: (params) => getProductTypeName(params.value || "module")
  },
  {
    field: "isSaas",
    headerName: "SaaS",
    width: 80,
    cellRenderer: (params: { value: boolean }) => {
      const isSaas = params.value;
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isSaas
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      }">${isSaas ? "Evet" : "Hayır"}</span>`;
    }
  },
  {
    field: "salePrice",
    headerName: "Satış Fiyatı",
    width: 120,
    valueFormatter: (params) => {
      if (params.value === undefined || params.value === null) return "";
      return params.value.toFixed(2);
    }
  },
  {
    field: "currency",
    headerName: "Para Birimi",
    width: 100,
    valueFormatter: (params) => getCurrencyName(params.value || "usd")
  },
  {
    field: "vatRate",
    headerName: "KDV %",
    width: 80,
    valueFormatter: (params) => (params.value ? `%${params.value}` : "")
  },
  {
    field: "unit",
    headerName: "Birim",
    width: 80
  },
  {
    field: "saleActive",
    headerName: "Satışta",
    width: 100,
    cellRenderer: (params: { value: boolean }) => {
      const isActive = params.value;
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      }">${isActive ? "Evet" : "Hayır"}</span>`;
    }
  }
];
