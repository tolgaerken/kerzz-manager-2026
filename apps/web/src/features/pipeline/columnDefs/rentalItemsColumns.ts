import type { GridColumnDef } from "@kerzz/grid";
import type { PipelineRental } from "../types/pipeline.types";
import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";

const CURRENCY_OPTIONS = [...PIPELINE_CONSTANTS.CURRENCIES];
const BILLING_PERIOD_OPTIONS = [...PIPELINE_CONSTANTS.BILLING_PERIOD_OPTIONS];

const currencyFormatter = (value: unknown) => {
  if (value == null) return "";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value as number);
};

export const rentalItemsColumns: GridColumnDef<Partial<PipelineRental>>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Ürün",
    width: 180,
    minWidth: 140,
    editable: true,
    cellEditor: { type: "text" },
  },
  {
    id: "pid",
    accessorKey: "pid",
    header: "PID",
    width: 90,
    editable: true,
    cellEditor: { type: "text" },
  },
  {
    id: "rentPeriod",
    accessorKey: "rentPeriod",
    header: "Fatura Periodu",
    width: 130,
    editable: true,
    cellEditor: {
      type: "select",
      options: BILLING_PERIOD_OPTIONS,
    },
    valueFormatter: (value) => {
      const found = BILLING_PERIOD_OPTIONS.find(
        (option) => String(option.id) === String(value),
      );
      return found?.name || String(value ?? "");
    },
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
    header: "Aylık Fiyat",
    width: 120,
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
    id: "discountTotal",
    accessorKey: "discountTotal",
    header: "İskonto Tutarı",
    width: 120,
    align: "right",
    editable: false,
    valueFormatter: currencyFormatter,
  },
  {
    id: "discountedMonthlyPrice",
    accessorKey: "discountedMonthlyPrice",
    header: "İskontolu Aylık Fiyat",
    width: 150,
    align: "right",
    editable: false,
    cell: (_value, row) => {
      const price = row.price || 0;
      const discountRate = row.discountRate || 0;
      const discountedPrice = price * (1 - discountRate / 100);
      return currencyFormatter(discountedPrice);
    },
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
