import type { ColDef } from "ag-grid-community";
import type { ContractUser } from "../../../types";

export const roleOptions = [
  { value: "account", label: "Muhasebe" },
  { value: "it", label: "Bilişim" },
  { value: "management", label: "Yönetim" },
  { value: "other", label: "Diğer" }
];

export const contractUsersColumns: ColDef<ContractUser>[] = [
  {
    field: "name",
    headerName: "Ad Soyad",
    flex: 2,
    minWidth: 150
  },
  {
    field: "email",
    headerName: "E-posta",
    flex: 2,
    minWidth: 180
  },
  {
    field: "gsm",
    headerName: "Telefon",
    flex: 1,
    minWidth: 120
  },
  {
    field: "role",
    headerName: "Rol",
    flex: 1,
    minWidth: 120,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: roleOptions.map((r) => r.value)
    },
    valueFormatter: (params) => {
      const role = roleOptions.find((r) => r.value === params.value);
      return role?.label || params.value || "";
    }
  },
  {
    field: "editDate",
    headerName: "Düzenleme",
    flex: 1,
    minWidth: 120,
    editable: false,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString("tr-TR");
    }
  }
];
