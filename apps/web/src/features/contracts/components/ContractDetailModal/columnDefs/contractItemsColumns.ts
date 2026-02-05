import type { ColDef } from "ag-grid-community";
import type { ContractItem } from "../../../types";
import { CURRENCY_OPTIONS } from "../../../constants";
import { SelectCellEditor } from "../shared/cellEditors/SelectCellEditor";

export const contractItemsColumns: ColDef<ContractItem>[] = [
  {
    field: "enabled",
    headerName: "Aktif",
    width: 70,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "✓" : "✗",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: [true, false]
    }
  },
  {
    field: "itemId",
    headerName: "Ürün",
    width: 120,
    flex: 1
  },
  {
    field: "description",
    headerName: "Açıklama",
    flex: 2,
    minWidth: 150
  },
  {
    field: "qty",
    headerName: "Adet",
    width: 70,
    type: "numericColumn"
  },
  {
    field: "price",
    headerName: "Fiyat",
    width: 100,
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
    field: "yearly",
    headerName: "Yıllık",
    width: 70,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "Evet" : "Hayır",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: [true, false]
    }
  },
  {
    field: "currency",
    headerName: "Döviz",
    width: 80,
    cellEditor: SelectCellEditor,
    cellEditorParams: {
      options: CURRENCY_OPTIONS
    },
    valueFormatter: (params) => {
      const found = CURRENCY_OPTIONS.find((c) => c.id === params.value);
      return found?.name || params.value?.toUpperCase() || "";
    }
  },
  {
    field: "qtyDynamic",
    headerName: "D.Adet",
    width: 80,
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
    width: 100,
    editable: false,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  }
];
