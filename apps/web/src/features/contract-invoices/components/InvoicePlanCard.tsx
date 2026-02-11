import { memo } from "react";
import { Calendar, Building2, CheckCircle2, XCircle, ChevronRight, Lock, AlertTriangle } from "lucide-react";
import type { EnrichedPaymentPlan } from "../types";
import { SEGMENT_COLORS } from "../types";

interface InvoicePlanCardProps {
  plan: EnrichedPaymentPlan;
  onClick: (plan: EnrichedPaymentPlan) => void;
  selected?: boolean;
  onSelect?: (plan: EnrichedPaymentPlan) => void;
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
function formatCurrency(value: number | undefined | null): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

// Segment badge component
function SegmentBadge({ segment }: { segment: string }) {
  if (!segment) return null;
  const bg = SEGMENT_COLORS[segment] || "transparent";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
      style={{ backgroundColor: bg }}
    >
      {segment}
    </span>
  );
}

export const InvoicePlanCard = memo(function InvoicePlanCard({
  plan,
  onClick,
  selected,
  onSelect
}: InvoicePlanCardProps) {
  const handleClick = () => {
    onClick(plan);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(plan);
  };

  // Bakiye durumu
  const hasPositiveBalance = plan.balance > 0 && plan.balance !== -100;
  const balanceDisplay = plan.balance === -100 ? "—" : formatCurrency(plan.balance);

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
      {/* Header: Sözleşme No, Segment, Seçim */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
              #{plan.contractNumber}
            </span>
            <SegmentBadge segment={plan.segment} />
            {plan.block && (
              <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-warning)]">
                <Lock className="h-3 w-3" />
              </span>
            )}
            {plan.invoiceError && (
              <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-error)]">
                <AlertTriangle className="h-3 w-3" />
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {plan.brand || "-"}
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
        <span className="truncate">{plan.company || "-"}</span>
      </div>

      {/* Plan Tarihi */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{formatDate(plan.payDate)}</span>
        {plan.invoiceNo && (
          <span className="ml-auto text-[var(--color-foreground)]">
            Fatura: {plan.invoiceNo}
          </span>
        )}
      </div>

      {/* Footer: Tutar, Bakiye, Ödeme Durumu */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div className="flex gap-4">
          <div>
            <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">
              Tutar
            </span>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              {formatCurrency(plan.total)}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">
              Bakiye
            </span>
            <p className={`text-sm font-semibold ${hasPositiveBalance ? "text-[var(--color-error)]" : "text-[var(--color-foreground)]"}`}>
              {balanceDisplay}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {plan.paid ? (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-success)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ödendi
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[var(--color-muted-foreground)]">
              <XCircle className="h-3.5 w-3.5" />
              Ödenmedi
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
