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
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-[var(--color-surface)] rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Belge Detayı
            </h2>
            <span className="text-sm text-[var(--color-foreground-muted)]">
              ({documentId})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-foreground-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : details.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-foreground-muted)]">
              Belge detayı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
          <div className="text-sm text-[var(--color-foreground-muted)]">
            {details.length} kalem
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-[var(--color-foreground-muted)]">Genel Toplam: </span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface)]/80 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
