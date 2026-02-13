import { useEffect, useMemo, useState } from "react";
import { X, FileText, Loader2, Calendar, DollarSign } from "lucide-react";
import { useInvoicesModalStore } from "../../store/invoicesModalStore";
import { useInvoices } from "../../../invoices/hooks/useInvoices";
import type { Invoice } from "../../../invoices/types";

/**
 * Fatura filtre türleri
 */
type InvoiceFilterType = "overdue" | "unpaid" | "all";

/**
 * Para formatı
 */
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Tarih formatı
 */
function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Vade durumu kontrolü (vadesi geçmiş mi?)
 */
function isOverdue(invoice: Invoice): boolean {
  if (invoice.isPaid) return false;
  if (!invoice.dueDate) return false;
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

/**
 * Fatura tipi badge
 */
function InvoiceTypeBadge({ type }: { type: string }) {
  const typeMap: Record<string, { label: string; color: string }> = {
    contract: { label: "Kontrat", color: "var(--color-info)" },
    sale: { label: "Satış", color: "var(--color-primary)" },
    eDocuments: { label: "E-Belge", color: "var(--color-warning)" },
  };

  const config = typeMap[type] || { label: type, color: "var(--color-muted-foreground)" };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{
        color: config.color,
        backgroundColor: `color-mix(in oklch, ${config.color} 15%, transparent)`,
      }}
    >
      {config.label}
    </span>
  );
}

/**
 * Fatura satır bileşeni
 */
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const overdue = isOverdue(invoice);
  const rowClass = overdue
    ? "bg-[var(--color-error)]/5 border-l-4 border-l-[var(--color-error)]"
    : invoice.isPaid
      ? "bg-[var(--color-success)]/5"
      : "bg-[var(--color-warning)]/5 border-l-4 border-l-[var(--color-warning)]";

  return (
    <div className={`p-3 sm:p-4 rounded-lg border border-[var(--color-border)] ${rowClass}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Sol: Fatura bilgileri */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <span className="font-medium text-[var(--color-foreground)]">
              {invoice.invoiceNumber || invoice.name || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <InvoiceTypeBadge type={invoice.invoiceType} />
            {invoice.isPaid && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-[var(--color-success-foreground)] bg-[var(--color-success)]/10">
                Ödendi
              </span>
            )}
            {overdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-[var(--color-error-foreground)] bg-[var(--color-error)]/10">
                Vadesi Geçti
              </span>
            )}
          </div>
        </div>

        {/* Orta: Tarih bilgileri */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Fatura: {formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
            <span className={overdue ? "text-[var(--color-error)]" : ""}>
              Vade: {formatDate(invoice.dueDate)}
            </span>
          </div>
          {invoice.isPaid && invoice.paymentSuccessDate && (
            <div className="flex items-center gap-2 text-[var(--color-success)]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ödeme: {formatDate(invoice.paymentSuccessDate)}</span>
            </div>
          )}
        </div>

        {/* Sağ: Tutar bilgileri */}
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <DollarSign className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <span className="font-semibold text-[var(--color-foreground)]">
              {formatCurrency(invoice.grandTotal)}
            </span>
          </div>
          {invoice.lateFeeTotal > 0 && (
            <div className="text-xs text-[var(--color-error)]">
              Gecikme Bedeli: {formatCurrency(invoice.lateFeeTotal)}
            </div>
          )}
        </div>
      </div>

      {invoice.description && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
          {invoice.description}
        </div>
      )}
    </div>
  );
}

/**
 * Faturalar modalı (erpId = CariKodu bazında)
 */
export function InvoicesModal() {
  const { isOpen, erpId, erpName, closeModal } = useInvoicesModalStore();

  // Filtre durumu (varsayılan: vadesi geçmiş)
  const [filterType, setFilterType] = useState<InvoiceFilterType>("overdue");

  // Modal açıldığında filtreyi sıfırla
  useEffect(() => {
    if (isOpen) {
      setFilterType("overdue");
    }
  }, [isOpen]);

  // Faturalar (erpId bazında) - Backend'den erpId ile filtrelenmiş olarak gelir
  const { data: invoicesData, isLoading } = useInvoices(
    {
      erpId: erpId,
      page: 1,
      limit: 1000, // Tüm faturaları çek
      sortField: "dueDate",
      sortOrder: "desc",
    },
    isOpen && !!erpId
  );

  // API'den gelen veri zaten erpId ile filtrelenmiş
  const allInvoices = useMemo(() => {
    return invoicesData?.data || [];
  }, [invoicesData?.data]);

  // Filtreye göre faturaları göster
  const filteredInvoices = useMemo(() => {
    if (filterType === "all") return allInvoices;
    
    if (filterType === "unpaid") {
      return allInvoices.filter((inv) => !inv.isPaid);
    }
    
    // overdue: vadesi geçmiş ve ödenmemiş
    return allInvoices.filter((inv) => isOverdue(inv));
  }, [allInvoices, filterType]);

  // Özet istatistikler
  const summary = useMemo(() => {
    const total = allInvoices.length;
    const paid = allInvoices.filter((inv) => inv.isPaid).length;
    const unpaid = total - paid;
    const overdue = allInvoices.filter((inv) => isOverdue(inv)).length;
    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const unpaidAmount = allInvoices
      .filter((inv) => !inv.isPaid)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);

    return { total, paid, unpaid, overdue, totalAmount, unpaidAmount };
  }, [allInvoices]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // Modal açıldığında body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl bg-[var(--color-surface)] rounded-lg shadow-xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
                Faturalar
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">{erpName}</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 sm:p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Filtre Butonları */}
        {!isLoading && allInvoices.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/30">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("overdue")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterType === "overdue"
                    ? "bg-[var(--color-error)] text-[var(--color-error-foreground)]"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                Vadesi Geçmiş ({summary.overdue})
              </button>
              <button
                onClick={() => setFilterType("unpaid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterType === "unpaid"
                    ? "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                Ödenmemiş ({summary.unpaid})
              </button>
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                Hepsi ({summary.total})
              </button>
            </div>
          </div>
        )}

        {/* Özet */}
        {!isLoading && allInvoices.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-[var(--color-muted-foreground)]">Gösterilen: </span>
                <span className="font-semibold text-[var(--color-foreground)]">
                  {filteredInvoices.length}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-muted-foreground)]">Ödenen: </span>
                <span className="font-semibold text-[var(--color-success)]">{summary.paid}</span>
              </div>
              <div>
                <span className="text-[var(--color-muted-foreground)]">Ödenmemiş: </span>
                <span className="font-semibold text-[var(--color-warning)]">{summary.unpaid}</span>
              </div>
              <div>
                <span className="text-[var(--color-muted-foreground)]">Vadesi Geçti: </span>
                <span className="font-semibold text-[var(--color-error)]">{summary.overdue}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--color-border)]/50 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Toplam Tutar:</span>
                <span className="font-semibold">{formatCurrency(summary.totalAmount)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[var(--color-muted-foreground)]">Ödenmemiş Tutar:</span>
                <span className="font-semibold text-[var(--color-error)]">
                  {formatCurrency(summary.unpaidAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : allInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-[var(--color-muted-foreground)] mb-3" />
              <p className="text-[var(--color-muted-foreground)]">Fatura bulunamadı</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-[var(--color-muted-foreground)] mb-3" />
              <p className="text-[var(--color-muted-foreground)]">
                {filterType === "overdue" && "Vadesi geçmiş fatura bulunamadı"}
                {filterType === "unpaid" && "Ödenmemiş fatura bulunamadı"}
              </p>
              <button
                onClick={() => setFilterType("all")}
                className="mt-3 px-4 py-2 text-sm bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:opacity-90 transition-opacity"
              >
                Tüm Faturaları Göster
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <InvoiceRow key={invoice._id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
