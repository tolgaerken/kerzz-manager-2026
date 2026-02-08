import type { GridColumnDef } from "@kerzz/grid";
import type { PipelineProduct } from "../types/pipeline.types";
import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";
import {
  PipelineProductAutocompleteEditor,
  type PipelineProductOption,
} from "../components/cellEditors/PipelineProductAutocompleteEditor";

const CURRENCY_OPTIONS = [...PIPELINE_CONSTANTS.CURRENCIES];

const currencyFormatter = (value: unknown) => {
  if (value == null) return "";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value as number);
};

export const productItemsColumns: GridColumnDef<Partial<PipelineProduct>>[] = [
  {
    id: "productId",
    accessorKey: "productId",
    header: "Ürün",
    width: 220,
    minWidth: 140,
    editable: true,
    cellEditor: {
      type: "custom",
      customEditor: PipelineProductAutocompleteEditor,
    },
    cell: (value, _row, context) => {
      if (!value) return "";
      const valueStr = String(value);
      const products =
        ((context as Record<string, unknown>)?.products as PipelineProductOption[]) ||
        [];
      const found = products.find((p) => p.id === valueStr);
      return found?.nameWithCode || found?.friendlyName || found?.name || valueStr;
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Ad",
    width: 200,
    minWidth: 140,
    editable: false,
  },
  {
    id: "erpId",
    accessorKey: "erpId",
    header: "ERP",
    width: 90,
    editable: true,
    cellEditor: { type: "text" },
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Miktar",
    width: 80,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Fiyat",
    width: 110,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
    valueFormatter: currencyFormatter,
  },
  {
    id: "currency",
    accessorKey: "currency",
    header: "Döviz",
    width: 80,
    editable: true,
    cellEditor: {
      type: "select",
      options: CURRENCY_OPTIONS,
    },
    valueFormatter: (value) => {
      const found = CURRENCY_OPTIONS.find((c) => c.id === value);
      return found?.name || String(value ?? "").toUpperCase();
    },
  },
  {
    id: "vatRate",
    accessorKey: "vatRate",
    header: "KDV %",
    width: 80,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
  },
  {
    id: "discountRate",
    accessorKey: "discountRate",
    header: "İndirim %",
    width: 90,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
  },
  {
    id: "subTotal",
    accessorKey: "subTotal",
    header: "Ara Toplam",
    width: 110,
    align: "right",
    editable: false,
    valueFormatter: currencyFormatter,
  },
  {
    id: "grandTotal",
    accessorKey: "grandTotal",
    header: "Toplam",
    width: 110,
    align: "right",
    editable: false,
    valueFormatter: currencyFormatter,
  },
];
