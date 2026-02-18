import type { GridColumnDef } from "@kerzz/grid";
import type { CustomerSegment } from "../../types";

export const customerSegmentColumnDefs: GridColumnDef<CustomerSegment>[] = [
  {
    id: "name",
    header: "Segment Adı",
    accessorKey: "name",
    width: 200,
    minWidth: 150,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "description",
    header: "Açıklama",
    accessorKey: "description",
    width: 250,
    minWidth: 150,
    sortable: true,
    filter: { type: "input" }
  },
  {
    id: "invoiceOverdueNotification",
    header: "Fatura Gecikme",
    accessorKey: "invoiceOverdueNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "newInvoiceNotification",
    header: "Yeni Fatura",
    accessorKey: "newInvoiceNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "lastPaymentNotification",
    header: "Son Ödeme",
    accessorKey: "lastPaymentNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "balanceNotification",
    header: "Cari Bakiye",
    accessorKey: "balanceNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "annualContractExpiryNotification",
    header: "Yıllık Kontrat",
    accessorKey: "annualContractExpiryNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "monthlyContractExpiryNotification",
    header: "Aylık Kontrat",
    accessorKey: "monthlyContractExpiryNotification",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-success)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "canBlockCashRegister",
    header: "Yazar Kasa Blok",
    accessorKey: "canBlockCashRegister",
    width: 130,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "canBlockLicense",
    header: "Lisans Blok",
    accessorKey: "canBlockLicense",
    width: 120,
    sortable: true,
    cell: (value) => (value ? "Evet" : "Hayır"),
    cellClassName: (value) =>
      value
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-muted-foreground)]"
  },
  {
    id: "enabled",
    header: "Durum",
    accessorKey: "enabled",
    width: 100,
    sortable: true,
    cell: (value) => (value ? "Aktif" : "Pasif"),
    cellClassName: (value) =>
      value ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
  }
];
