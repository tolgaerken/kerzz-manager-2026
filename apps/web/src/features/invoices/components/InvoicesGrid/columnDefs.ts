import type { ColDef } from "ag-grid-community";
import type { Invoice } from "../../types";

// Para formatı
const currencyFormatter = (params: { value: number }) => {
  if (params.value === null || params.value === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(params.value);
};

// Tarih formatı
const dateFormatter = (params: { value: string | Date }) => {
  if (!params.value) return "";
  const date = new Date(params.value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

// Ödeme durumu cell renderer
const paymentStatusRenderer = (params: { value: boolean }) => {
  if (params.value) {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ödendi</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Ödenmedi</span>`;
};

// Fatura tipi renderer
const invoiceTypeRenderer = (params: { value: string }) => {
  const typeMap: Record<string, { label: string; className: string }> = {
    contract: { label: "Kontrat", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    sale: { label: "Satış", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    eDocuments: { label: "E-Belge", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
  };
  
  const type = typeMap[params.value] || { label: params.value, className: "bg-gray-100 text-gray-800" };
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${type.className}">${type.label}</span>`;
};

export const invoiceColumnDefs: ColDef<Invoice>[] = [
  {
    field: "isPaid",
    headerName: "Durum",
    width: 100,
    cellRenderer: paymentStatusRenderer
  },
  {
    field: "invoiceNumber",
    headerName: "Fatura No",
    width: 140,
    filter: true
  },
  {
    field: "name",
    headerName: "Müşteri",
    flex: 1,
    minWidth: 200,
    filter: true
  },
  {
    field: "description",
    headerName: "Açıklama",
    flex: 1,
    minWidth: 150,
    filter: true
  },
  {
    field: "invoiceDate",
    headerName: "Fatura Tarihi",
    width: 120,
    valueFormatter: dateFormatter,
    sort: "desc"
  },
  {
    field: "dueDate",
    headerName: "Son Ödeme",
    width: 120,
    valueFormatter: dateFormatter,
    cellClass: (params) => {
      if (!params.value || params.data?.isPaid) return "";
      const dueDate = new Date(params.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today ? "text-red-500 font-semibold" : "";
    }
  },
  {
    field: "invoiceType",
    headerName: "Tip",
    width: 100,
    cellRenderer: invoiceTypeRenderer
  },
  {
    field: "total",
    headerName: "Tutar",
    width: 120,
    valueFormatter: currencyFormatter,
    cellClass: "text-right"
  },
  {
    field: "taxTotal",
    headerName: "KDV",
    width: 100,
    valueFormatter: currencyFormatter,
    cellClass: "text-right"
  },
  {
    field: "grandTotal",
    headerName: "Genel Toplam",
    width: 130,
    valueFormatter: currencyFormatter,
    cellClass: "text-right font-semibold text-blue-600"
  },
  {
    field: "internalFirm",
    headerName: "Firma",
    width: 100,
    filter: true
  },
  {
    field: "paymentSuccessDate",
    headerName: "Ödeme Tarihi",
    width: 120,
    valueFormatter: dateFormatter
  }
];
