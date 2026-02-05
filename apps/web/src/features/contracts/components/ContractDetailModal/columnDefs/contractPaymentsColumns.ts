import type { ColDef } from "ag-grid-community";
import type { ContractPayment } from "../../../types";

export const contractPaymentsColumns: ColDef<ContractPayment>[] = [
  {
    field: "invoiceNo",
    headerName: "Fatura No",
    flex: 1,
    minWidth: 120
  },
  {
    field: "invoiceDate",
    headerName: "Fatura Tarihi",
    flex: 1,
    minWidth: 100,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  },
  {
    field: "invoiceTotal",
    headerName: "Fatura Tutarı",
    flex: 1,
    minWidth: 120,
    type: "numericColumn",
    valueFormatter: (params) => {
      if (params.value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(params.value);
    }
  },
  {
    field: "total",
    headerName: "Ödenen",
    flex: 1,
    minWidth: 100,
    type: "numericColumn",
    valueFormatter: (params) => {
      if (params.value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(params.value);
    }
  },
  {
    field: "balance",
    headerName: "Bakiye",
    flex: 1,
    minWidth: 100,
    type: "numericColumn",
    editable: false,
    valueFormatter: (params) => {
      if (params.value == null) return "";
      return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(params.value);
    }
  },
  {
    field: "paid",
    headerName: "Ödendi",
    flex: 0.5,
    minWidth: 80,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "Evet" : "Hayır",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: [true, false]
    }
  },
  {
    field: "paymentDate",
    headerName: "Ödeme Tarihi",
    flex: 1,
    minWidth: 100,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  },
  {
    field: "yearly",
    headerName: "Yıllık",
    flex: 0.5,
    minWidth: 80,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "Evet" : "Hayır",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: [true, false]
    }
  },
  {
    field: "editDate",
    headerName: "Düzenleme",
    flex: 1,
    minWidth: 100,
    editable: false,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  }
];
