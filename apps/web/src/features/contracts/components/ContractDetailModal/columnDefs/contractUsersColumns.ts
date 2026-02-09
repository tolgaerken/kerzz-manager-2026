import type { GridColumnDef } from "@kerzz/grid";
import type { ContractUser } from "../../../types";

export const roleOptions = [
  { id: "account", name: "Muhasebe" },
  { id: "it", name: "Bilişim" },
  { id: "management", name: "Yönetim" },
  { id: "other", name: "Diğer" }
];

export const contractUsersColumns: GridColumnDef<ContractUser>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Ad Soyad",
    width: 200,
    minWidth: 150,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "email",
    accessorKey: "email",
    header: "E-posta",
    width: 220,
    minWidth: 180,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "gsm",
    accessorKey: "gsm",
    header: "Telefon",
    width: 140,
    minWidth: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: { type: "text" }
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Rol",
    width: 140,
    minWidth: 120,
    filter: { type: "dropdown" },
    editable: true,
    cellEditor: {
      type: "select",
      options: roleOptions
    },
    valueFormatter: (value) => {
      const role = roleOptions.find((r) => r.id === value);
      return role?.name || String(value ?? "");
    }
  },
  {
    id: "editDate",
    accessorKey: "editDate",
    header: "Düzenleme",
    width: 120,
    minWidth: 120,
    filter: { type: "dropdown" },
    editable: false,
    valueFormatter: (value) => {
      if (!value) return "";
      return new Date(value as string).toLocaleDateString("tr-TR");
    }
  }
];
