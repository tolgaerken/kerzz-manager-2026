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

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
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
    field: "customerName",
    headerName: "Müşteri",
    flex: 1,
    minWidth: 180,
    sortable: true,
    filter: "agTextColumnFilter",
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
    width: 130,
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
    field: "balance",
    headerName: "Bakiye",
    width: 140,
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<AutoPaymentTokenItem>) =>
      formatCurrency(params.value),
    cellClass: (params) => {
      const val = params.value as number;
      if (val > 0) return "text-red-600 font-semibold";
      if (val < 0) return "text-green-600 font-semibold";
      return "";
    },
  },
  {
    field: "source",
    headerName: "Kaynak",
    width: 80,
    sortable: true,
  },
];
