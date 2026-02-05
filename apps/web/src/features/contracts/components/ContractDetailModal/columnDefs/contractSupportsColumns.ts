import type { ColDef, ICellEditorParams } from "ag-grid-community";
import type { ContractSupport } from "../../../types";
import { CURRENCY_OPTIONS, SUPPORT_TYPES } from "../../../constants";
import { LicenseAutocompleteEditor } from "../shared/cellEditors/LicenseAutocompleteEditor";
import { SelectCellEditor } from "../shared/cellEditors/SelectCellEditor";

// Context'ten gelen veri tipleri
interface GridContext {
  licenses: Array<{ id: string; brandName: string; SearchItem: string }>;
  onLicenseSelect?: (rowId: string, license: { id: string; brandName: string } | null) => void;
}

export const contractSupportsColumns: ColDef<ContractSupport>[] = [
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
    field: "type",
    headerName: "Segment",
    width: 120,
    cellEditor: SelectCellEditor,
    cellEditorParams: {
      options: SUPPORT_TYPES
    },
    valueFormatter: (params) => {
      const found = SUPPORT_TYPES.find((t) => t.id === params.value);
      return found?.name || params.value || "";
    }
  },
  {
    field: "licanceId",
    headerName: "Lisans",
    width: 250,
    flex: 2,
    cellEditor: LicenseAutocompleteEditor,
    cellEditorParams: (params: ICellEditorParams<ContractSupport>) => {
      const context = params.context as GridContext;
      return {
        licenses: context?.licenses || [],
        onLicenseSelect: (license: { id: string; brandName: string } | null) => {
          if (context?.onLicenseSelect && params.data?.id) {
            context.onLicenseSelect(params.data.id, license);
          }
        }
      };
    },
    cellRenderer: (params: { value: string; context: GridContext }) => {
      if (!params.value) return "";
      const valueStr = String(params.value);
      const licenses = params.context?.licenses || [];
      const found = licenses.find((l) => l.id === valueStr);
      return found?.SearchItem || found?.brandName || params.value;
    }
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
    field: "calulatedPrice",
    headerName: "H.Fiyat",
    width: 100,
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
    field: "yearly",
    headerName: "Yıllık",
    width: 70,
    editable: false,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "Evet" : "Hayır"
  },
  {
    field: "lastOnlineDay",
    headerName: "Gün?",
    width: 70,
    type: "numericColumn",
    editable: false
  },
  {
    field: "blocked",
    headerName: "Blok?",
    width: 70,
    editable: false,
    cellRenderer: (params: { value: boolean }) =>
      params.value ? "✓" : "✗"
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
