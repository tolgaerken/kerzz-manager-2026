import type { ColDef } from "ag-grid-community";
import type { ContractDocument } from "../../../types";

export const contractDocumentsColumns: ColDef<ContractDocument>[] = [
  {
    field: "filename",
    headerName: "Dosya Adı",
    flex: 2,
    minWidth: 150
  },
  {
    field: "description",
    headerName: "Açıklama",
    flex: 2,
    minWidth: 180
  },
  {
    field: "type",
    headerName: "Tip",
    flex: 1,
    minWidth: 100
  },
  {
    field: "documentVersion",
    headerName: "Versiyon",
    flex: 0.5,
    minWidth: 80
  },
  {
    field: "documentDate",
    headerName: "Belge Tarihi",
    flex: 1,
    minWidth: 100,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  },
  {
    field: "userId",
    headerName: "Yükleyen",
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
