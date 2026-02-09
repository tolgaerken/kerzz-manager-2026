import type { GridColumnDef } from "@kerzz/grid";
import type { ContractVersion } from "../../../types";

const currencyOptions = [
  { id: "tl", name: "TL" },
  { id: "usd", name: "USD" },
  { id: "eur", name: "EUR" }
];

export const contractVersionsColumns: GridColumnDef<ContractVersion>[] = [
  {
    id: "brand",
    accessorKey: "brand",
    header: "Marka",
    width: 150,
    minWidth: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tip",
    width: 130,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Fiyat",
    width: 120,
    minWidth: 100,
    align: "right",
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "number" },
    footer: {
      aggregate: "sum",
      format: (value) => {
        if (value == null) return "";
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value as number);
    }
  },
  {
    id: "currency",
    accessorKey: "currency",
    header: "Döviz",
    width: 90,
    minWidth: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: {
      type: "select",
      options: currencyOptions
    },
    valueFormatter: (value) => String(value ?? "").toUpperCase()
  },
  {
    id: "enabled",
    accessorKey: "enabled",
    header: "Aktif",
    width: 90,
    minWidth: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "expired",
    accessorKey: "expired",
    header: "Süresi Doldu",
    width: 110,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "editUser",
    accessorKey: "editUser",
    header: "Düzenleyen",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: false
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
