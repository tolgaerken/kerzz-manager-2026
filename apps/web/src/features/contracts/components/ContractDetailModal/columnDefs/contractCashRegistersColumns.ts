import type { ColDef } from "ag-grid-community";
import type { ContractCashRegister } from "../../../types";

const currencyOptions = ["tl", "usd", "eur"];

export const contractCashRegistersColumns: ColDef<ContractCashRegister>[] = [
  {
    field: "brand",
    headerName: "Marka",
    flex: 1,
    minWidth: 120
  },
  {
    field: "model",
    headerName: "Model",
    flex: 1,
    minWidth: 120
  },
  {
    field: "type",
    headerName: "Tip",
    flex: 1,
    minWidth: 100
  },
  {
    field: "legalId",
    headerName: "Legal ID",
    flex: 1,
    minWidth: 120
  },
  {
    field: "price",
    headerName: "Fiyat",
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
    field: "currency",
    headerName: "Döviz",
    flex: 0.5,
    minWidth: 80,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: currencyOptions
    },
    valueFormatter: (params) => params.value?.toUpperCase() || ""
  },
  {
    field: "eftPosActive",
    headerName: "EFT POS",
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
    field: "enabled",
    headerName: "Aktif",
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
