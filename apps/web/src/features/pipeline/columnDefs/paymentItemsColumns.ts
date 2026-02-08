import type { GridColumnDef } from "@kerzz/grid";
import type { PipelinePayment } from "../types/pipeline.types";
import { PIPELINE_CONSTANTS } from "../constants/pipeline.constants";

const CURRENCY_OPTIONS = [...PIPELINE_CONSTANTS.CURRENCIES];
const PAYMENT_METHOD_OPTIONS = [...PIPELINE_CONSTANTS.PAYMENT_METHODS];

export const paymentItemsColumns: GridColumnDef<Partial<PipelinePayment>>[] = [
  {
    id: "description",
    accessorKey: "description",
    header: "Açıklama",
    width: 200,
    minWidth: 140,
    editable: true,
    cellEditor: { type: "text" },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Tutar",
    width: 120,
    align: "right",
    editable: true,
    cellEditor: { type: "number" },
    valueFormatter: (value) => {
      if (value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value as number);
    },
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
    id: "paymentDate",
    accessorKey: "paymentDate",
    header: "Tarih",
    width: 110,
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    },
  },
  {
    id: "method",
    accessorKey: "method",
    header: "Yöntem",
    width: 120,
    editable: true,
    cellEditor: {
      type: "select",
      options: PAYMENT_METHOD_OPTIONS,
    },
    valueFormatter: (value) => {
      const found = PAYMENT_METHOD_OPTIONS.find((m) => m.id === value);
      return found?.name || String(value ?? "");
    },
  },
  {
    id: "isPaid",
    accessorKey: "isPaid",
    header: "Ödendi",
    width: 80,
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "—"),
  },
  {
    id: "invoiceNo",
    accessorKey: "invoiceNo",
    header: "Fatura No",
    width: 120,
    editable: true,
    cellEditor: { type: "text" },
  },
];
