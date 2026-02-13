import type { GridColumnDef } from "@kerzz/grid";
import type { IntegratorStatusItem } from "../../types";

export function getColumnDefs(): GridColumnDef<IntegratorStatusItem>[] {
  return [
    {
      id: "taxpayerVknTckn",
      header: "VKN/TCKN",
      accessorKey: "taxpayerVknTckn",
      width: 130,
      sortable: true,
      resizable: true,
      filter: { type: "input", conditions: ["contains", "startsWith", "equals"] },
    },
    {
      id: "taxpayerName",
      header: "Mükellef Adı",
      accessorKey: "taxpayerName",
      width: 320,
      sortable: true,
      resizable: true,
      filter: { type: "input", conditions: ["contains", "startsWith", "equals"] },
    },
    {
      id: "date",
      header: "Tarih",
      accessorKey: "date",
      width: 120,
      sortable: true,
      resizable: true,
      filter: { type: "dateTree" },
      cell: (value) => {
        if (!value) return "-";
        return new Date(value as string).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
    },
    {
      id: "eInvoiceCount",
      header: "e-Fatura",
      accessorKey: "eInvoiceCount",
      width: 100,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "errorEInvoiceCount",
      header: "e-Fatura Hata",
      accessorKey: "errorEInvoiceCount",
      width: 120,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
      cell: (value) => {
        const num = value as number;
        if (num > 0) {
          return `⚠ ${num}`;
        }
        return String(num);
      },
    },
    {
      id: "eWaybillCount",
      header: "e-İrsaliye",
      accessorKey: "eWaybillCount",
      width: 110,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "errorEWaybillCount",
      header: "e-İrsaliye Hata",
      accessorKey: "errorEWaybillCount",
      width: 130,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
      cell: (value) => {
        const num = value as number;
        if (num > 0) {
          return `⚠ ${num}`;
        }
        return String(num);
      },
    },
    {
      id: "eArchiveInvoiceCount",
      header: "e-Arşiv",
      accessorKey: "eArchiveInvoiceCount",
      width: 100,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "eArchiveInvoiceExcludedFromReportCount",
      header: "e-Arşiv (Rapor Dışı)",
      accessorKey: "eArchiveInvoiceExcludedFromReportCount",
      width: 160,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "eReceiptCount",
      header: "e-Adisyon",
      accessorKey: "eReceiptCount",
      width: 110,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "eReceiptExcludedFromReportCount",
      header: "e-Adisyon (Rapor Dışı)",
      accessorKey: "eReceiptExcludedFromReportCount",
      width: 170,
      sortable: true,
      resizable: true,
      align: "right",
      footer: { aggregate: "sum" },
    },
    {
      id: "eArchiveReportGibStatus",
      header: "e-Arşiv GİB Durumu",
      accessorKey: "eArchiveReportGibStatus",
      width: 180,
      sortable: true,
      resizable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "eArchiveReportStatusCode",
      header: "e-Arşiv Durum Kodu",
      accessorKey: "eArchiveReportStatusCode",
      width: 180,
      sortable: true,
      resizable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "eReceiptReportGibStatus",
      header: "e-Adisyon GİB Durumu",
      accessorKey: "eReceiptReportGibStatus",
      width: 190,
      sortable: true,
      resizable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "eReceiptReportStatusCode",
      header: "e-Adisyon Durum Kodu",
      accessorKey: "eReceiptReportStatusCode",
      width: 190,
      sortable: true,
      resizable: true,
      filter: { type: "dropdown", showCounts: true },
    },
  ];
}
