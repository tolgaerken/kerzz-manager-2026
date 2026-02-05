import type { ColDef } from "ag-grid-community";
import type { ContractVersion } from "../../../types";

const currencyOptions = ["tl", "usd", "eur"];

export const contractVersionsColumns: ColDef<ContractVersion>[] = [
  {
    field: "brand",
    headerName: "Marka",
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
    field: "expired",
    headerName: "Süresi Doldu",
    flex: 0.5,
    minWidth: 100,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "Evet" : "Hayır",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: [true, false]
    }
  },
  {
    field: "editUser",
    headerName: "Düzenleyen",
    flex: 1,
    minWidth: 100,
    editable: false
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
