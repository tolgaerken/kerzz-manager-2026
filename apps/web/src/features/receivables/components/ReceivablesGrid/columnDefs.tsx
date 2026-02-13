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

/** Ödenmemiş fatura özeti tipi */
type UnpaidInfo = { count: number; totalAmount: number };

export function createColumnDefs(
  unpaidMap?: Map<string, UnpaidInfo>
): GridColumnDef<ErpBalance>[] {
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
      id: "unpaidInvoiceCount",
      header: "Fatura Adedi",
      // accessorFn: Filtreleme/sıralama için lookup'tan gerçek değeri döner
      accessorFn: (row: ErpBalance) => unpaidMap?.get(row.CariKodu)?.count ?? 0,
      width: 100,
      sortable: true,
      filter: { type: "numeric" },
      align: "right",
      cell: (_value, row) => {
        const unpaid = unpaidMap?.get(row.CariKodu);
        return unpaid ? formatNumber(unpaid.count) : "0";
      },
      cellClassName: (_value, row) => {
        const unpaid = unpaidMap?.get(row.CariKodu);
        const classes = "font-mono text-right";
        if (unpaid && unpaid.count > 0) return `text-[var(--color-error)] font-semibold ${classes}`;
        return classes;
      },
      footer: {
        aggregate: "custom",
        label: "",
        customFn: (values) => {
          if (!unpaidMap) return 0;
          return values.reduce<number>((sum, value) => {
            if (typeof value !== "number") return sum;
            return sum + value;
          }, 0);
        },
        format: (v) => formatNumber(v),
      },
    },
    {
      id: "unpaidInvoiceAmount",
      header: "Fatura Tutarı",
      // accessorFn: Filtreleme/sıralama için lookup'tan gerçek değeri döner
      accessorFn: (row: ErpBalance) =>
        unpaidMap?.get(row.CariKodu)?.totalAmount ?? 0,
      width: 140,
      sortable: true,
      filter: { type: "numeric" },
      align: "right",
      cell: (_value, row) => {
        const unpaid = unpaidMap?.get(row.CariKodu);
        return unpaid ? formatCurrency(unpaid.totalAmount) : formatCurrency(0);
      },
      cellClassName: (_value, row) => {
        const unpaid = unpaidMap?.get(row.CariKodu);
        const classes = "font-mono text-right";
        if (unpaid && unpaid.totalAmount > 0) return `text-[var(--color-error)] font-semibold ${classes}`;
        return classes;
      },
      footer: {
        aggregate: "custom",
        label: "",
        customFn: (values) => {
          if (!unpaidMap) return 0;
          return values.reduce<number>((sum, value) => {
            if (typeof value !== "number") return sum;
            return sum + value;
          }, 0);
        },
        format: (v) => formatCurrency(v),
      },
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
