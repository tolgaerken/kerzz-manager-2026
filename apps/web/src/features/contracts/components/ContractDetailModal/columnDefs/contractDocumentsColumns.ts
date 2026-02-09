import type { GridColumnDef } from "@kerzz/grid";
import type { ContractDocument } from "../../../types";

export const contractDocumentsColumns: GridColumnDef<ContractDocument>[] = [
  {
    id: "filename",
    accessorKey: "filename",
    header: "Dosya Adı",
    width: 200,
    minWidth: 150,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Açıklama",
    width: 220,
    minWidth: 180,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tip",
    width: 130,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "documentVersion",
    accessorKey: "documentVersion",
    header: "Versiyon",
    width: 90,
    minWidth: 80,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "documentDate",
    accessorKey: "documentDate",
    header: "Belge Tarihi",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "userId",
    accessorKey: "userId",
    header: "Yükleyen",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: false
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 120,
    minWidth: 100,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
