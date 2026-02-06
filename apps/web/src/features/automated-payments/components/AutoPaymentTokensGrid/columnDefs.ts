import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { AutoPaymentTokenItem } from "../../types/automatedPayment.types";

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const tokenColumnDefs: ColDef<AutoPaymentTokenItem>[] = [
  {
    field: "companyId",
    headerName: "Firma",
    width: 100,
    sortable: true,
    filter: "agTextColumnFilter",
  },
  {
    field: "createDate",
    headerName: "Tarih",
    width: 150,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams<AutoPaymentTokenItem>) =>
      formatDate(params.value),
  },
  {
    field: "email",
    headerName: "E-posta",
    flex: 1,
    minWidth: 180,
    sortable: true,
    filter: "agTextColumnFilter",
  },
  {
    field: "customerId",
    headerName: "Müşteri ID",
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: "agTextColumnFilter",
    cellClass: "font-mono text-xs",
  },
  {
    field: "erpId",
    headerName: "ERP ID",
    width: 120,
    sortable: true,
    filter: "agTextColumnFilter",
    cellClass: "font-mono text-xs",
  },
  {
    field: "source",
    headerName: "Kaynak",
    width: 80,
    sortable: true,
  },
];
