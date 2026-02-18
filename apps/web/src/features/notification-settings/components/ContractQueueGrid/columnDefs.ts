import type { GridColumnDef } from "@kerzz/grid";
import type { QueueContractItem } from "../../types";

export const contractQueueColumnDefs: GridColumnDef<QueueContractItem>[] = [
  {
    id: "contractFirm",
    header: "Kontrat / Firma",
    minWidth: 200,
    accessorFn: (row) => {
      const main = row.contractId || row.company || "";
      return row.brand ? `${main} — ${row.brand}` : main;
    },
    cellClassName: "font-medium",
  },
  {
    id: "customer",
    header: "Müşteri",
    minWidth: 180,
    accessorFn: (row) => row.customer?.companyName || row.customer?.name || "",
  },
  {
    id: "endDate",
    header: "Bitiş Tarihi",
    accessorKey: "endDate",
    width: 120,
  },
  {
    id: "remainingDays",
    header: "Kalan Gün",
    accessorKey: "remainingDays",
    width: 100,
  },
  {
    id: "contact",
    header: "İletişim",
    width: 200,
    accessorFn: (row) => row.customer?.email || row.customer?.phone || "—",
    cellClassName: "text-[var(--color-muted-foreground)]",
  },
];
