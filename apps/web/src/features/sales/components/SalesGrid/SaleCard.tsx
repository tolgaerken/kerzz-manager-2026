import { memo } from "react";
import { ShoppingCart, User, Calendar, Building2, ChevronRight } from "lucide-react";
import type { Sale } from "../../types/sale.types";

interface SaleCardProps {
  sale: Sale;
  onClick: (sale: Sale) => void;
  selected?: boolean;
  onSelect?: (sale: Sale) => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  pending: "Beklemede",
  "collection-waiting": "Tahsilat Bekleniyor",
  "setup-waiting": "Kurulum Bekleniyor",
  "training-waiting": "Eğitim Bekleniyor",
  active: "Aktif",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: {
    bg: "bg-[var(--color-muted-foreground)]/10",
    text: "text-[var(--color-muted-foreground)]",
  },
  pending: {
    bg: "bg-[var(--color-warning)]/10",
    text: "text-[var(--color-warning)]",
  },
  "collection-waiting": {
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
  },
  "setup-waiting": {
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
  },
  "training-waiting": {
    bg: "bg-[var(--color-info)]/10",
    text: "text-[var(--color-info)]",
  },
  active: {
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
  },
  completed: {
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
  },
  cancelled: {
    bg: "bg-[var(--color-error)]/10",
    text: "text-[var(--color-error)]",
  },
};

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

export const SaleCard = memo(function SaleCard({ sale, onClick, selected, onSelect }: SaleCardProps) {
  const statusKey = Array.isArray(sale.status) ? sale.status[0] : sale.status;
  const statusLabel = STATUS_LABELS[statusKey || "draft"] || statusKey || "-";
  const statusColor = STATUS_COLORS[statusKey || "draft"] || STATUS_COLORS.draft;

  const handleClick = () => {
    onClick(sale);
  };

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
      className={`relative rounded-lg border bg-[var(--color-surface)] p-3 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98] ${
        selected
          ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
          : "border-[var(--color-border)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="rounded-full bg-[var(--color-primary)]/10 p-1.5 shrink-0">
            <ShoppingCart className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[var(--color-foreground)] truncate">
                {sale.no || sale.pipelineRef || "-"}
              </span>
              <span
                className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor.bg} ${statusColor.text}`}
              >
                {statusLabel}
              </span>
            </div>
            <span className="text-xs text-[var(--color-muted-foreground)] truncate">
              {sale.customerName || "-"}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-[var(--color-muted-foreground)]" />
          <span className="text-[var(--color-muted-foreground)] truncate">
            {sale.sellerName || "-"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-[var(--color-muted-foreground)]" />
          <span className="text-[var(--color-muted-foreground)]">
            {formatDate(sale.saleDate)}
          </span>
        </div>
        {sale.internalFirm && (
          <div className="flex items-center gap-1.5 col-span-2">
            <Building2 className="h-3 w-3 text-[var(--color-muted-foreground)]" />
            <span className="text-[var(--color-muted-foreground)] truncate">
              {sale.internalFirm}
            </span>
          </div>
        )}
      </div>

      {/* Footer - Total */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]/50">
        <span className="text-xs text-[var(--color-muted-foreground)]">Toplam</span>
        <span className="text-sm font-semibold text-[var(--color-foreground)]">
          {formatCurrency(sale.grandTotal)}
        </span>
      </div>
    </div>
  );
});
