import type { GridColumnDef } from "@kerzz/grid";
import type { ContractItem } from "../../../types";
import { CURRENCY_OPTIONS } from "../../../constants";
import { DateCellEditor } from "../shared/cellEditors/DateCellEditor";

export const contractItemsColumns: GridColumnDef<ContractItem>[] = [
  {
    id: "enabled",
    accessorKey: "enabled",
    header: "Aktif",
    width: 70,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "itemId",
    accessorKey: "itemId",
    header: "Ürün",
    width: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Açıklama",
    width: 200,
    minWidth: 150,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Adet",
    width: 70,
    align: "right",
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "number" },
    footer: {
      aggregate: "sum"
    }
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Fiyat",
    width: 100,
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
    id: "yearly",
    accessorKey: "yearly",
    header: "Yıllık",
    width: 70,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "currency",
    accessorKey: "currency",
    header: "Döviz",
    width: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: {
      type: "select",
      options: [...CURRENCY_OPTIONS]
    },
    valueFormatter: (value) => {
      const found = CURRENCY_OPTIONS.find((c) => c.id === value);
      return found?.name || String(value ?? "").toUpperCase();
    }
  },
  {
    id: "qtyDynamic",
    accessorKey: "qtyDynamic",
    header: "D.Adet",
    width: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "startDate",
    accessorKey: "startDate",
    header: "Başlangıç",
    width: 110,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "custom", customEditor: DateCellEditor },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "activated",
    accessorKey: "activated",
    header: "Kuruldu",
    width: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "activatedAt",
    accessorKey: "activatedAt",
    header: "Kurulum T.",
    width: 110,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 100,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
