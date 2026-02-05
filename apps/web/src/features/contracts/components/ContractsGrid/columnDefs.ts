import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { Contract } from "../../types";

// Date formatter
function dateFormatter(params: ValueFormatterParams<Contract>): string {
  if (!params.value) return "-";
  const date = new Date(params.value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// Currency formatter
function currencyFormatter(params: ValueFormatterParams<Contract>): string {
  if (params.value === null || params.value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2
  }).format(params.value);
}

// Contract flow formatter
function flowFormatter(params: ValueFormatterParams<Contract>): string {
  const flowMap: Record<string, string> = {
    active: "Aktif",
    archive: "Arşiv",
    future: "Gelecek"
  };
  return flowMap[params.value] || params.value || "-";
}

// Yearly formatter
function yearlyFormatter(params: ValueFormatterParams<Contract>): string {
  return params.value ? "Yıllık" : "Aylık";
}

// Boolean formatter
function booleanFormatter(params: ValueFormatterParams<Contract>): string {
  return params.value ? "Evet" : "Hayır";
}

export const contractColumnDefs: ColDef<Contract>[] = [
  {
    field: "no",
    headerName: "No",
    width: 90,
    sortable: true,
    filter: "agNumberColumnFilter"
  },
  {
    field: "brand",
    headerName: "Marka",
    flex: 1,
    minWidth: 200,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "company",
    headerName: "Firma",
    flex: 1,
    minWidth: 250,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "description",
    headerName: "Açıklama",
    width: 150,
    sortable: true,
    filter: "agTextColumnFilter"
  },
  {
    field: "contractFlow",
    headerName: "Durum",
    width: 110,
    sortable: true,
    filter: "agTextColumnFilter",
    valueFormatter: flowFormatter,
    cellClass: (params) => {
      const flowClasses: Record<string, string> = {
        active: "text-success",
        archive: "text-muted",
        future: "text-info"
      };
      return flowClasses[params.value] || "";
    }
  },
  {
    field: "yearly",
    headerName: "Periyot",
    width: 100,
    sortable: true,
    valueFormatter: yearlyFormatter
  },
  {
    field: "startDate",
    headerName: "Başlangıç",
    width: 120,
    sortable: true,
    filter: "agDateColumnFilter",
    valueFormatter: dateFormatter
  },
  {
    field: "endDate",
    headerName: "Bitiş",
    width: 120,
    sortable: true,
    filter: "agDateColumnFilter",
    valueFormatter: dateFormatter
  },
  {
    field: "yearlyTotal",
    headerName: "Yıllık Tutar",
    width: 140,
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: currencyFormatter,
    type: "rightAligned"
  },
  {
    field: "saasTotal",
    headerName: "SaaS Tutar",
    width: 140,
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: currencyFormatter,
    type: "rightAligned"
  },
  {
    field: "enabled",
    headerName: "Aktif",
    width: 80,
    sortable: true,
    valueFormatter: booleanFormatter
  },
  {
    field: "blockedLicance",
    headerName: "Lisans Engeli",
    width: 120,
    sortable: true,
    valueFormatter: booleanFormatter
  },
  {
    field: "internalFirm",
    headerName: "İç Firma",
    width: 100,
    sortable: true,
    filter: "agTextColumnFilter"
  }
];
