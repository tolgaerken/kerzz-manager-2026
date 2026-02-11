import { memo } from "react";
import { Calendar, Building2, User, ChevronRight, DollarSign } from "lucide-react";
import type { Offer, OfferStatus } from "../../types/offer.types";

interface OfferCardProps {
  offer: Offer;
  onClick: (offer: Offer) => void;
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

// Status badge component
function StatusBadge({ status }: { status: OfferStatus }) {
  const config: Record<OfferStatus, { label: string; className: string }> = {
    draft: {
      label: "Taslak",
      className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
    },
    sent: {
      label: "Gönderildi",
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)]"
    },
    revised: {
      label: "Revize",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
    },
    waiting: {
      label: "Beklemede",
      className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
    },
    approved: {
      label: "Onaylandı",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
    },
    rejected: {
      label: "Reddedildi",
      className: "bg-[var(--color-error)]/10 text-[var(--color-error)]"
    },
    won: {
      label: "Kazanıldı",
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]"
    },
    lost: {
      label: "Kaybedildi",
      className: "bg-[var(--color-error)]/10 text-[var(--color-error)]"
    },
    converted: {
      label: "Dönüştürüldü",
      className: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
    }
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}

export const OfferCard = memo(function OfferCard({
  offer,
  onClick
}: OfferCardProps) {
  const handleClick = () => {
    onClick(offer);
  };

  const totalAmount = offer.totals?.overallGrandTotal || (offer as any).grandTotal || 0;

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
      className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]"
    >
      {/* Header: No, Status */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
              #{offer.no || offer.pipelineRef?.slice(-6) || "-"}
            </span>
            <StatusBadge status={offer.status} />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {offer.customerName || "-"}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-1" />
      </div>

      {/* Customer */}
      <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{offer.customerName || "-"}</span>
      </div>

      {/* Seller */}
      {offer.sellerName && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <User className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{offer.sellerName}</span>
        </div>
      )}

      {/* Date Range */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{formatDate(offer.saleDate)}</span>
        {offer.validUntil && (
          <>
            <span className="text-[var(--color-muted-foreground)]">→</span>
            <span>{formatDate(offer.validUntil)}</span>
          </>
        )}
      </div>

      {/* Footer: Amount */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div>
          <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Toplam</span>
          <p className="flex items-center gap-1 text-sm font-semibold text-[var(--color-foreground)]">
            <DollarSign className="h-3.5 w-3.5" />
            {formatCurrency(totalAmount)}
          </p>
        </div>
        {offer.internalFirm && (
          <span className="text-[10px] text-[var(--color-muted-foreground)] bg-[var(--color-surface-elevated)] px-2 py-0.5 rounded">
            {offer.internalFirm}
          </span>
        )}
      </div>
    </div>
  );
});
