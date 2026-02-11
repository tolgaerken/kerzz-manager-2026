import { ShoppingCart, User, Calendar, Building2 } from "lucide-react";
import type { Sale } from "../../types/sale.types";

interface SaleCardProps {
  sale: Sale;
  onClick?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  pending: "Beklemede",
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
  completed: {
    bg: "bg-[var(--color-success)]/10",
    text: "text-[var(--color-success)]",
  },
  cancelled: {
    bg: "bg-[var(--color-error)]/10",
    text: "text-[var(--color-error)]",
  },
};

export function SaleCard({ sale, onClick }: SaleCardProps) {
  const statusKey = Array.isArray(sale.status) ? sale.status[0] : sale.status;
  const statusLabel = STATUS_LABELS[statusKey || "draft"] || statusKey || "-";
  const statusColor = STATUS_COLORS[statusKey || "draft"] || STATUS_COLORS.draft;

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  return (
    <div
      onClick={onClick}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 active:bg-[var(--color-surface-hover)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="rounded-full bg-[var(--color-primary)]/10 p-1.5 shrink-0">
            <ShoppingCart className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-[var(--color-foreground)] truncate">
              {sale.no || sale.pipelineRef || "-"}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)] truncate">
              {sale.customerName || "-"}
            </span>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor.bg} ${statusColor.text}`}
        >
          {statusLabel}
        </span>
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
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-muted-foreground)]">Toplam</span>
        <span className="text-sm font-semibold text-[var(--color-primary)]">
          {formatCurrency(sale.grandTotal)}
        </span>
      </div>
    </div>
  );
}
