import type { GridColumnDef } from "@kerzz/grid";
import type { ContractCashRegister } from "../../../types";
import { CASH_REGISTER_TYPES, CURRENCY_OPTIONS } from "../../../constants";
import { LicenseAutocompleteEditor } from "../shared/cellEditors/LicenseAutocompleteEditor";
import { DateCellEditor } from "../shared/cellEditors/DateCellEditor";

interface License {
  id: string;
  brandName: string;
  SearchItem: string;
}

interface EftPosModel {
  id: string;
  name: string;
}

export const contractCashRegistersColumns: GridColumnDef<ContractCashRegister>[] = [
  {
    id: "enabled",
    accessorKey: "enabled",
    header: "Aktif",
    width: 70,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tür",
    width: 90,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: {
      type: "select",
      options: [...CASH_REGISTER_TYPES]
    },
    valueFormatter: (value) => {
      const found = CASH_REGISTER_TYPES.find((t) => t.id === value);
      return found?.name || String(value ?? "");
    }
  },
  {
    id: "model",
    accessorKey: "model",
    header: "Model",
    width: 150,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: {
      type: "select",
      options: (_row, context) => {
        return (context?.eftPosModels as EftPosModel[]) || [];
      }
    },
    cell: (value, _row, context) => {
      const models = ((context as Record<string, unknown>)?.eftPosModels as EftPosModel[]) || [];
      const found = models.find((m) => m.id === value);
      return found?.name || String(value ?? "");
    }
  },
  {
    id: "legalId",
    accessorKey: "legalId",
    header: "Sicil No",
    width: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "licanceId",
    accessorKey: "licanceId",
    header: "Lisans",
    width: 280,
    filter: { type: "dropdown" },
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
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "number" },
    footer: {
      aggregate: "sum",
      format: (value) => {
        if (value == null) return "";
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      }
    },
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
    filter: { type: "dropdown" },
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
    id: "eftPosActive",
    accessorKey: "eftPosActive",
    header: "EPA",
    width: 70,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "folioClose",
    accessorKey: "folioClose",
    header: "FC",
    width: 60,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "boolean" },
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "startDate",
    accessorKey: "startDate",
    header: "Başlangıç",
    width: 110,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "custom", customEditor: DateCellEditor },
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
  {
    id: "activated",
    accessorKey: "activated",
    header: "Kuruldu",
    width: 80,
    filter: { type: "dropdown" },
    editable: false,
    cell: (value) => (value ? "✓" : "✗")
  },
  {
    id: "activatedAt",
    accessorKey: "activatedAt",
    header: "Kurulum T.",
    width: 110,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  },
];
