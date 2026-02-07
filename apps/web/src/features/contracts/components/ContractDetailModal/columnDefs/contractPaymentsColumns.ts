import type { GridColumnDef } from "@kerzz/grid";
import type { ContractPayment } from "../../../types";

export const contractPaymentsColumns: GridColumnDef<ContractPayment>[] = [
  {
    id: "invoiceNo",
    accessorKey: "invoiceNo",
    header: "Fatura No",
    width: 140,
    minWidth: 120,
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "invoiceDate",
    accessorKey: "invoiceDate",
    header: "Fatura Tarihi",
    width: 120,
    minWidth: 100,
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "invoiceTotal",
    accessorKey: "invoiceTotal",
    header: "Fatura Tutarı",
    width: 130,
    minWidth: 120,
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
    header: "Ödenen",
    width: 120,
    minWidth: 100,
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
    id: "balance",
    accessorKey: "balance",
    header: "Bakiye",
    width: 120,
    minWidth: 100,
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
    id: "paid",
    accessorKey: "paid",
    header: "Ödendi",
    width: 90,
    minWidth: 80,
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "paymentDate",
    accessorKey: "paymentDate",
    header: "Ödeme Tarihi",
    width: 120,
    minWidth: 100,
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "yearly",
    accessorKey: "yearly",
    header: "Yıllık",
    width: 90,
    minWidth: 80,
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 120,
    minWidth: 100,
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
