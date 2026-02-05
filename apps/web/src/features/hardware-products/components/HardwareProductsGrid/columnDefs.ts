import type { ColDef } from "ag-grid-community";
import type { HardwareProduct } from "../../types";
import { getCurrencyName } from "../../constants/hardware-products.constants";

export const hardwareProductColumnDefs: ColDef<HardwareProduct>[] = [
  {
    field: "id",
    headerName: "Kod",
    width: 100,
    pinned: "left"
  },
  {
    field: "name",
    headerName: "Ürün Adı",
    flex: 1,
    minWidth: 200
  },
  {
    field: "friendlyName",
    headerName: "Kullanıcı Adı",
    flex: 1,
    minWidth: 180
  },
  {
    field: "erpId",
    headerName: "ERP Kodu",
    width: 100
  },
  {
    field: "purchasePrice",
    headerName: "Alış Fiyatı",
    width: 120,
    valueFormatter: (params) => {
      if (params.value === undefined || params.value === null) return "";
      return params.value.toFixed(2);
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
