import { useEffect } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import type { DocumentDetail } from "../../types";

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  details: DocumentDetail[];
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DocumentDetailModal({
  isOpen,
  onClose,
  documentId,
  details,
  loading,
}: DocumentDetailModalProps) {
  const total = details.reduce((sum, d) => sum + (d.TOPLAM || 0), 0);

  // ESC tuşu ile kapatma
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl md:mx-4 bg-[var(--color-surface)] md:rounded-lg shadow-xl flex flex-col h-full md:h-auto md:max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-primary)] flex-shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-[var(--color-foreground)]">
              Belge Detayı
            </h2>
            <span className="text-xs md:text-sm text-[var(--color-foreground-muted)] truncate">
              ({documentId})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 md:p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : details.length === 0 ? (
            <div className="p-8 md:p-12 text-center text-sm md:text-base text-[var(--color-foreground-muted)]">
              Belge detayı bulunamadı
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <table className="hidden md:table w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-surface-elevated)]">
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-foreground-muted)]">
                      Stok Kodu
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-foreground-muted)]">
                      Stok Adı
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">
                      Miktar
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">
                      Birim Fiyat
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">
                      KDV %
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">
                      Toplam
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, index) => (
                    <tr
                      key={`${detail.STOK_KODU}-${index}`}
                      className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-elevated)]/50"
                    >
                      <td className="px-4 py-3 text-[var(--color-foreground)]">
                        {detail.STOK_KODU}
                      </td>
                      <td className="px-4 py-3 text-[var(--color-foreground)]">
                        {detail.STOK_ADI}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-foreground)]">
                        {formatNumber(detail.MIKTAR)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-foreground)]">
                        {formatCurrency(detail.BIRIM_FIYAT)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-foreground)]">
                        %{detail.STHAR_KDV}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-foreground)]">
                        {formatCurrency(detail.TOPLAM)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="md:hidden p-4 space-y-3">
                {details.map((detail, index) => (
                  <div
                    key={`${detail.STOK_KODU}-${index}`}
                    className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-surface)]"
                  >
                    <div className="font-medium text-[var(--color-foreground)] mb-1">
                      {detail.STOK_KODU}
                    </div>
                    <div className="text-sm text-[var(--color-foreground)] mb-3">
                      {detail.STOK_ADI}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[var(--color-muted-foreground)]">Miktar: </span>
                        <span className="text-[var(--color-foreground)]">{formatNumber(detail.MIKTAR)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--color-muted-foreground)]">Birim: </span>
                        <span className="text-[var(--color-foreground)]">{formatCurrency(detail.BIRIM_FIYAT)}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted-foreground)]">KDV: </span>
                        <span className="text-[var(--color-foreground)]">%{detail.STHAR_KDV}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--color-muted-foreground)]">Toplam: </span>
                        <span className="font-medium text-[var(--color-foreground)]">{formatCurrency(detail.TOPLAM)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <div className="text-xs md:text-sm text-[var(--color-foreground-muted)]">
            {details.length} kalem
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <div className="text-center sm:text-right">
              <span className="text-xs md:text-sm text-[var(--color-foreground-muted)]">Genel Toplam: </span>
              <span className="text-base md:text-lg font-bold text-[var(--color-primary)]">
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface)]/80 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
