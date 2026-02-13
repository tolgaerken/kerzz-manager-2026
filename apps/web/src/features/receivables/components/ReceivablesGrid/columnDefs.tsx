import type { GridColumnDef } from "@kerzz/grid";
import type { ErpBalance } from "../../../erp-balances";

// Para formatı
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

// Sayı formatı (gün gibi)
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("tr-TR").format(value);
};

export function createColumnDefs(): GridColumnDef<ErpBalance>[] {
  return [
    {
      id: "CariKodu",
      header: "Cari Kodu",
      accessorKey: "CariKodu",
      width: 120,
      sortable: true,
      filter: { type: "input" },
      cellClassName: "font-mono",
    },
    {
      id: "CariUnvan",
      header: "Cari Unvan",
      accessorKey: "CariUnvan",
      minWidth: 250,
      sortable: true,
      filter: { type: "input" },
      footer: { aggregate: "count", label: "" },
    },
    {
      id: "internalFirm",
      header: "Firma",
      accessorKey: "internalFirm",
      width: 90,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "GrupKodu",
      header: "Grup",
      accessorKey: "GrupKodu",
      width: 100,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
    },
    {
      id: "CariBakiye",
      header: "Bakiye",
      accessorKey: "CariBakiye",
      width: 140,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: (value) => {
        const num = value as number;
        const classes = "font-mono text-right";
        if (num > 0) return `text-[var(--color-error)] font-semibold ${classes}`;
        if (num < 0) return `text-[var(--color-success)] font-semibold ${classes}`;
        return classes;
      },
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v),
      },
    },
    {
      id: "ToplamGecikme",
      header: "Vadesi Geçmiş",
      accessorKey: "ToplamGecikme",
      width: 140,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: (value) => {
        const num = value as number;
        const classes = "font-mono text-right";
        if (num > 0) return `text-[var(--color-error)] font-semibold ${classes}`;
        return classes;
      },
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v),
      },
    },
    {
      id: "VadesiGelmemis",
      header: "Vadesi Gelmemiş",
      accessorKey: "VadesiGelmemis",
      width: 140,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: "font-mono text-right",
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v),
      },
    },
    {
      id: "Bugun",
      header: "Bugün",
      accessorKey: "Bugun",
      width: 130,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: (value) => {
        const num = value as number;
        const classes = "font-mono text-right";
        if (num > 0) return `text-[var(--color-warning)] font-semibold ${classes}`;
        return classes;
      },
      footer: {
        aggregate: "sum",
        label: "",
        format: (v) => formatCurrency(v),
      },
    },
    {
      id: "CariVade",
      header: "Vadeli Tutar",
      accessorKey: "CariVade",
      width: 130,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: "font-mono text-right",
    },
    {
      id: "GECIKMEGUN",
      header: "Gecikme (Gün)",
      accessorKey: "GECIKMEGUN",
      width: 110,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatNumber(value as number),
      cellClassName: (value) => {
        const num = value as number;
        const classes = "font-mono text-right";
        if (num > 30) return `text-[var(--color-error)] font-semibold ${classes}`;
        if (num > 0) return `text-[var(--color-warning)] ${classes}`;
        return classes;
      },
    },
    {
      id: "Limiti",
      header: "Limit",
      accessorKey: "Limiti",
      width: 130,
      sortable: true,
      align: "right",
      filter: { type: "numeric" },
      cell: (value) => formatCurrency(value as number),
      cellClassName: "font-mono text-right",
    },
    {
      id: "VergiN",
      header: "Vergi No",
      accessorKey: "VergiN",
      width: 120,
      sortable: true,
      filter: { type: "input" },
      visible: false,
    },
    {
      id: "TcKimlik",
      header: "TC Kimlik",
      accessorKey: "TcKimlik",
      width: 120,
      sortable: true,
      filter: { type: "input" },
      visible: false,
    },
  ];
}
