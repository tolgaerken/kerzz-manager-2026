import type { GridColumnDef } from "@kerzz/grid";
import type { QueueInvoiceItem } from "../../types";

const formatCurrency = (value: unknown): string => {
  if (value == null) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value as number);
};

export const invoiceQueueColumnDefs: GridColumnDef<QueueInvoiceItem>[] = [
  {
    id: "invoiceNumber",
    header: "Fatura No",
    accessorKey: "invoiceNumber",
    width: 140,
    cellClassName: "font-mono",
  },
  {
    id: "customer",
    header: "Müşteri",
    minWidth: 180,
    accessorFn: (row) => row.customer?.companyName || row.customer?.name || "",
  },
  {
    id: "grandTotal",
    header: "Tutar",
    accessorKey: "grandTotal",
    width: 130,
    valueFormatter: formatCurrency,
    align: "right",
  },
  {
    id: "dueDate",
    header: "Son Ödeme",
    accessorKey: "dueDate",
    width: 120,
  },
  {
    id: "overdueDays",
    header: "Geciken Gün",
    accessorKey: "overdueDays",
    width: 110,
    cell: (value) => {
      const days = value as number;
      return (
        <span
          className={
            days > 0
              ? "text-[var(--color-error)] font-medium"
              : "text-[var(--color-muted-foreground)]"
          }
        >
          {days}
        </span>
      );
    },
  },
  {
    id: "lastNotify",
    header: "Son Bildirim",
    accessorKey: "lastNotify",
    width: 120,
    valueFormatter: (value) => (value as string | null) ?? "—",
    cellClassName: "text-[var(--color-muted-foreground)]",
  },
  {
    id: "notifyCount",
    header: "Bildirim Sayısı",
    accessorKey: "notifyCount",
    width: 120,
  },
];
