import type { GridColumnDef } from "@kerzz/grid";
import type { ContractSupport } from "../../../types";
import { CURRENCY_OPTIONS, SUPPORT_TYPES } from "../../../constants";
import { LicenseAutocompleteEditor } from "../shared/cellEditors/LicenseAutocompleteEditor";

interface License {
  id: string;
  brandName: string;
  SearchItem: string;
}

export const contractSupportsColumns: GridColumnDef<ContractSupport>[] = [
  {
    id: "enabled",
    accessorKey: "enabled",
    header: "Aktif",
    width: 70,
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Segment",
    width: 120,
    editable: true,
    cellEditor: {
      type: "select",
      options: [...SUPPORT_TYPES]
    },
    valueFormatter: (value) => {
      const found = SUPPORT_TYPES.find((t) => t.id === value);
      return found?.name || String(value ?? "");
    }
  },
  {
    id: "licanceId",
    accessorKey: "licanceId",
    header: "Lisans",
    width: 250,
    editable: true,
    cellEditor: {
      type: "custom",
      customEditor: LicenseAutocompleteEditor
    },
    cell: (value, _row, context) => {
      if (!value) return "";
      const valueStr = String(value);
      const licenses = ((context as Record<string, unknown>)?.licenses as License[]) || [];
      const found = licenses.find((l) => l.id === valueStr);
      return found?.SearchItem || found?.brandName || String(value);
    }
  },
  {
    id: "price",
    accessorKey: "price",
    header: "Fiyat",
    width: 100,
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
    id: "calulatedPrice",
    accessorKey: "calulatedPrice",
    header: "H.Fiyat",
    width: 100,
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
    id: "currency",
    accessorKey: "currency",
    header: "Döviz",
    width: 80,
    editable: true,
    cellEditor: {
      type: "select",
      options: [...CURRENCY_OPTIONS]
    },
    valueFormatter: (value) => {
      const found = CURRENCY_OPTIONS.find((c) => c.id === value);
      return found?.name || String(value ?? "").toUpperCase();
    }
  },
  {
    id: "yearly",
    accessorKey: "yearly",
    header: "Yıllık",
    width: 70,
    editable: false,
    cell: (value) => (value ? "Evet" : "Hayır")
  },
  {
    id: "lastOnlineDay",
    accessorKey: "lastOnlineDay",
    header: "Gün?",
    width: 70,
    align: "right",
    editable: false
  },
  {
    id: "blocked",
    accessorKey: "blocked",
    header: "Blok?",
    width: 70,
    editable: false,
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 100,
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
