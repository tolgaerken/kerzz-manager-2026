import type { GridColumnDef } from "@kerzz/grid";
import type { ContractSaas } from "../../../types";
import { CURRENCY_OPTIONS } from "../../../constants";
import { LicenseAutocompleteEditor } from "../shared/cellEditors/LicenseAutocompleteEditor";
import { ProductAutocompleteEditor } from "../shared/cellEditors/ProductAutocompleteEditor";
import type { ProductOption } from "../shared/cellEditors/ProductAutocompleteEditor";

interface License {
  id: string;
  brandName: string;
  SearchItem: string;
}

export const contractSaasColumns: GridColumnDef<ContractSaas>[] = [
  {
    id: "enabled",
    accessorKey: "enabled",
    header: "Aktif",
    width: 70,
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "licanceId",
    accessorKey: "licanceId",
    header: "Lisans",
    width: 250,
    editable: true,
    cellEditor: {
      type: "custom",
      customEditor: LicenseAutocompleteEditor
    },
    cell: (value, _row, context) => {
      if (!value) return "";
      const valueStr = String(value);
      const licenses = ((context as Record<string, unknown>)?.licenses as License[]) || [];
      const found = licenses.find((l) => l.id === valueStr);
      return found?.SearchItem || found?.brandName || String(value);
    }
  },
  {
    id: "productId",
    accessorKey: "productId",
    header: "Ürün",
    width: 200,
    editable: true,
    cellEditor: {
      type: "custom",
      customEditor: ProductAutocompleteEditor
    },
    cell: (value, _row, context) => {
      if (!value) return "";
      const valueStr = String(value);
      const products = ((context as Record<string, unknown>)?.products as ProductOption[]) || [];
      const found = products.find((p) => p.id === valueStr);
      return found?.nameWithCode || found?.friendlyName || found?.name || String(value);
    }
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Açıklama",
    width: 200,
    minWidth: 150,
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Adet",
    width: 70,
    align: "right",
    editable: true,
    cellEditor: { type: "number" }
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Fiyat",
    width: 100,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value as number);
    }
  },
  {
    id: "total",
    accessorKey: "total",
    header: "Toplam",
    width: 100,
    align: "right",
    editable: false,
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
    editable: false,
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "currency",
    accessorKey: "currency",
    header: "Döviz",
    width: 80,
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
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 100,
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
