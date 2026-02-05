import type { ColDef } from "ag-grid-community";
import type { Customer } from "../../types";

export const customerColumnDefs: ColDef<Customer>[] = [
  {
    field: "taxNo",
    headerName: "Vergi No",
    flex: 1,
    minWidth: 130,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "name",
    headerName: "Ad",
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "companyName",
    headerName: "Şirket Adı",
    flex: 1.5,
    minWidth: 200,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "city",
    headerName: "Şehir",
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "district",
    headerName: "İlçe",
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "phone",
    headerName: "Telefon",
    flex: 1,
    minWidth: 140,
    sortable: false,
    filter: "agTextColumnFilter"
  },
  {
    field: "email",
    headerName: "E-posta",
    flex: 1.2,
    minWidth: 180,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "enabled",
    headerName: "Durum",
    width: 100,
    sortable: true,
    valueFormatter: (params) => (params.value ? "Aktif" : "Pasif"),
    cellClass: (params) =>
      params.value ? "text-green-600" : "text-red-600"
  }
];
