import type { GridColumnDef } from "@kerzz/grid";
import type { QueueContractItem, ContractMilestone } from "../../types";

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMilestoneLabel(milestone: ContractMilestone | null): string {
  switch (milestone) {
    case "pre-expiry":
      return "Bitiş Öncesi";
    case "post-1":
      return "+1 Gün";
    case "post-3":
      return "+3 Gün";
    case "post-5":
      return "+5 Gün (Son Uyarı)";
    default:
      return "—";
  }
}

function getMilestoneColor(milestone: ContractMilestone | null): string {
  switch (milestone) {
    case "pre-expiry":
      return "bg-[var(--color-info)]/10 text-[var(--color-info)]";
    case "post-1":
      return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
    case "post-3":
      return "bg-[var(--color-warning)]/20 text-[var(--color-warning)]";
    case "post-5":
      return "bg-[var(--color-error)]/10 text-[var(--color-error)]";
    default:
      return "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]";
  }
}

export const yearlyContractQueueColumnDefs: GridColumnDef<QueueContractItem>[] = [
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
    minWidth: 160,
    accessorFn: (row) => row.customer?.companyName || row.customer?.name || "",
  },
  {
    id: "endDate",
    header: "Bitiş Tarihi",
    accessorKey: "endDate",
    width: 110,
  },
  {
    id: "milestone",
    header: "Durum",
    width: 130,
    accessorFn: (row) => row.milestone,
    cell: (_value, row) => {
      const label = getMilestoneLabel(row.milestone);
      const colorClass = getMilestoneColor(row.milestone);
      return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
          {label}
        </span>
      );
    },
  },
  {
    id: "oldAmount",
    header: "Mevcut Tutar",
    width: 120,
    accessorFn: (row) => row.oldAmount,
    cell: (_value, row) => (
      <span className="text-[var(--color-muted-foreground)]">
        {formatCurrency(row.oldAmount)}
      </span>
    ),
  },
  {
    id: "renewalAmount",
    header: "Yenileme Tutarı",
    width: 130,
    accessorFn: (row) => row.renewalAmount,
    cell: (_value, row) => (
      <span className="font-medium text-[var(--color-primary)]">
        {formatCurrency(row.renewalAmount)}
      </span>
    ),
  },
  {
    id: "increaseRateInfo",
    header: "Artış Oranı",
    width: 140,
    accessorKey: "increaseRateInfo",
    cell: (_value, row) => (
      <span className="text-xs text-[var(--color-muted-foreground)]">
        {row.increaseRateInfo || "—"}
      </span>
    ),
  },
  {
    id: "terminationDate",
    header: "Sonlandırma Tarihi",
    width: 130,
    accessorKey: "terminationDate",
    cell: (_value, row) => (
      <span className="text-xs text-[var(--color-error)]">
        {row.terminationDate || "—"}
      </span>
    ),
  },
  {
    id: "contact",
    header: "İletişim",
    width: 180,
    accessorFn: (row) => row.customer?.email || row.customer?.phone || "—",
    cellClassName: "text-[var(--color-muted-foreground)]",
  },
];
