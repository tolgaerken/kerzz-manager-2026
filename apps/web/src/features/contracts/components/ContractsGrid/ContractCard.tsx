import { memo } from "react";
import { Calendar, Building2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { LogBadge } from "../../../../components/ui";
import type { Contract } from "../../types";

interface ContractCardProps {
  contract: Contract;
  onClick: (contract: Contract) => void;
  selected?: boolean;
  onSelect?: (contract: Contract) => void;
  /** Son log tarihi (ISO date string) */
  lastLogAt?: string;
  /** Log panelini açmak için callback */
  onOpenLogs?: (contract: Contract) => void;
}

// Date formatter
function formatDate(value: string | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

// Currency formatter
function formatCurrency(value: number | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Flow badge component
function FlowBadge({ flow }: { flow: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: {
      label: "Aktif",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
    },
    archive: {
      label: "Arşiv",
      className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
    },
    future: {
      label: "Gelecek",
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
    },
    free: {
      label: "Ücretsiz",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
    }
  };

  const { label, className } = config[flow] ?? {
    label: flow,
    className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}

export const ContractCard = memo(function ContractCard({
  contract,
  onClick,
  selected,
  onSelect,
  lastLogAt,
  onOpenLogs
}: ContractCardProps) {
  const handleClick = () => {
    onClick(contract);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(contract);
  };

  const handleOpenLogs = () => {
    onOpenLogs?.(contract);
  };

  // Determine which total to show based on contract type
  const displayTotal = contract.yearly ? contract.yearlyTotal : contract.total;
  const periodLabel = contract.yearly ? "Yıllık" : "Aylık";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`relative rounded-lg border bg-[var(--color-surface)] p-2.5 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98] ${
        selected
          ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
          : "border-[var(--color-border)]"
      }`}
    >
      {/* Header: No, Brand, Status */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">#{contract.no}</span>
            <FlowBadge flow={contract.contractFlow} />
            {/* Log badge */}
            <LogBadge
              lastLogAt={lastLogAt}
              onClick={handleOpenLogs}
              size="sm"
            />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {contract.brand || "-"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onSelect && (
            <button
              onClick={handleSelect}
              className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              {selected && <CheckCircle2 className="h-3 w-3" />}
            </button>
          )}
          <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0" />
        </div>
      </div>

      {/* Company */}
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{contract.company || "-"}</span>
      </div>

      {/* Date Range */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
      </div>

      {/* Footer: Amount & Status */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div>
          <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">{periodLabel}</span>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{formatCurrency(displayTotal)}</p>
        </div>
        <div className="flex items-center gap-2">
          {contract.enabled ? (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-success)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aktif
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
              <XCircle className="h-3.5 w-3.5" />
              Pasif
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
