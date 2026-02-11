import { memo } from "react";
import { Calendar, Building2, CreditCard, ChevronRight, Clock, CheckCircle2, Loader2 } from "lucide-react";
import type { Invoice } from "../../types";

interface InvoiceCardProps {
  invoice: Invoice;
  onClick: (invoice: Invoice) => void;
  hasAutoPayment: boolean;
  isPendingPayment: boolean;
  balance?: number;
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

// Payment status badge
function PaymentStatusBadge({ isPaid, isPendingPayment }: { isPaid: boolean; isPendingPayment: boolean }) {
  if (isPendingPayment) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-warning)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-warning)]">
        <Loader2 className="h-3 w-3 animate-spin" />
        İşleniyor
      </span>
    );
  }

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
        <CheckCircle2 className="h-3 w-3" />
        Ödendi
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-error)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-error)]">
      <Clock className="h-3 w-3" />
      Ödenmedi
    </span>
  );
}

// Check if invoice is overdue
function isOverdue(dueDate: string | undefined, isPaid: boolean): boolean {
  if (!dueDate || isPaid) return false;
  return new Date(dueDate) < new Date();
}

export const InvoiceCard = memo(function InvoiceCard({
  invoice,
  onClick,
  hasAutoPayment,
  isPendingPayment,
  balance
}: InvoiceCardProps) {
  const handleClick = () => {
    onClick(invoice);
  };

  const overdue = isOverdue(invoice.dueDate, invoice.isPaid);

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
      className={`relative rounded-lg border p-2.5 transition-all hover:bg-[var(--color-surface-hover)] active:scale-[0.98] ${
        overdue
          ? "border-[var(--color-error)]/30 bg-[var(--color-error)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      {/* Header: Invoice Number, Status, Auto Payment */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
              {invoice.invoiceNumber || "-"}
            </span>
            <PaymentStatusBadge isPaid={invoice.isPaid} isPendingPayment={isPendingPayment} />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
            {invoice.name || "-"}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-1" />
      </div>

      {/* Company/Firm Info */}
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)] min-w-0">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{invoice.internalFirm || "VERI"}</span>
        </div>
        {hasAutoPayment && (
          <span className="flex items-center gap-1 rounded-full bg-[var(--color-info)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-info)] whitespace-nowrap">
            <CreditCard className="h-3 w-3" />
            Otomatik
          </span>
        )}
      </div>

      {/* Dates */}
      <div className="mb-2 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{formatDate(invoice.invoiceDate)}</span>
        </div>
        {invoice.dueDate && (
          <div className={`flex items-center gap-1.5 ${overdue ? "text-[var(--color-error)]" : ""}`}>
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(invoice.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Footer: Amount & Balance */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-1.5">
        <div>
          <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Genel Toplam</span>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            {formatCurrency(invoice.grandTotal)}
          </p>
        </div>
        {balance !== undefined && (
          <div className="text-right">
            <span className="text-[10px] text-[var(--color-muted-foreground)] uppercase tracking-wide">Cari Bakiye</span>
            <p className={`text-sm font-semibold ${balance > 0 ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
