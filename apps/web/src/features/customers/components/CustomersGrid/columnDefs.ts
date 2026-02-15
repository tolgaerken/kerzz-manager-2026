import type { GridColumnDef } from "@kerzz/grid";
import type { Customer } from "../../types";

export const customerColumnDefs: GridColumnDef<Customer>[] = [
  {
    id: "taxNo",
    header: "Vergi No",
    accessorKey: "taxNo",
    width: 130,
    minWidth: 130,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "name",
    header: "Şirket Adı",
    accessorKey: "name",
    width: 250,
    minWidth: 200,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "brand",
    header: "Marka",
    accessorKey: "brand",
    width: 150,
    minWidth: 150,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "city",
    header: "Şehir",
    accessorFn: (row) => row.address?.city || "",
    width: 120,
    minWidth: 120,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "district",
    header: "İlçe",
    accessorFn: (row) => row.address?.town || "",
    width: 120,
    minWidth: 120,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "phone",
    header: "Telefon",
    accessorKey: "phone",
    width: 140,
    minWidth: 140,
    sortable: false,
    filter: { type: "input" }
  },
  {
    id: "email",
    header: "E-posta",
    accessorKey: "email",
    width: 200,
    minWidth: 180,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "enabled",
    header: "Durum",
    accessorKey: "enabled",
    width: 100,
    sortable: true,
    cell: (value) => (value ? "Aktif" : "Pasif"),
    cellClassName: (value) => (value ? "text-[var(--color-success)]" : "text-[var(--color-error)]")
  }
];
