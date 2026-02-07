import type { GridColumnDef } from "@kerzz/grid";
import type { HardwareProduct } from "../../types";
import { getCurrencyName } from "../../constants/hardware-products.constants";

export const hardwareProductColumns: GridColumnDef<HardwareProduct>[] = [
  {
    id: "id",
    header: "Kod",
    accessorKey: "id",
    width: 100,
    pinned: "left",
    sortable: true,
    resizable: true
  },
  {
    id: "name",
    header: "Ürün Adı",
    accessorKey: "name",
    width: 200,
    sortable: true,
    resizable: true
  },
  {
    id: "friendlyName",
    header: "Kullanıcı Adı",
    accessorKey: "friendlyName",
    width: 180,
    sortable: true,
    resizable: true
  },
  {
    id: "erpId",
    header: "ERP Kodu",
    accessorKey: "erpId",
    width: 100,
    sortable: true,
    resizable: true
  },
  {
    id: "purchasePrice",
    header: "Alış Fiyatı",
    accessorKey: "purchasePrice",
    width: 120,
    sortable: true,
    resizable: true,
    align: "right",
    valueFormatter: (value) => {
      if (value === undefined || value === null) return "";
      return (value as number).toFixed(2);
    }
  },
  {
    id: "salePrice",
    header: "Satış Fiyatı",
    accessorKey: "salePrice",
    width: 120,
    sortable: true,
    resizable: true,
    align: "right",
    valueFormatter: (value) => {
      if (value === undefined || value === null) return "";
      return (value as number).toFixed(2);
    }
  },
  {
    id: "currency",
    header: "Para Birimi",
    accessorKey: "currency",
    width: 100,
    sortable: true,
    resizable: true,
    valueFormatter: (value) => getCurrencyName((value as string) || "usd")
  },
  {
    id: "vatRate",
    header: "KDV %",
    accessorKey: "vatRate",
    width: 80,
    sortable: true,
    resizable: true,
    valueFormatter: (value) => (value ? `%${value}` : "")
  },
  {
    id: "unit",
    header: "Birim",
    accessorKey: "unit",
    width: 80,
    sortable: true,
    resizable: true
  },
  {
    id: "saleActive",
    header: "Satışta",
    accessorKey: "saleActive",
    width: 100,
    sortable: true,
    resizable: true,
    cell: (value) => {
      const isActive = value as boolean;
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {isActive ? "Evet" : "Hayır"}
        </span>
      );
    }
  }
];
