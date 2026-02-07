import { useCallback } from "react";
import { X } from "lucide-react";
import type { PaymentListItem } from "../types";

// Para formati
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
};

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaymentListItem[];
  title?: string;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  items,
  title = "Fatura Kalemleri",
}: InvoiceDetailModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-2 font-medium text-[var(--color-muted-foreground)]">
                  #
                </th>
                <th className="text-left py-2 px-2 font-medium text-[var(--color-muted-foreground)]">
                  Açıklama
                </th>
                <th className="text-right py-2 px-2 font-medium text-[var(--color-muted-foreground)]">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="py-2 px-2 text-[var(--color-muted-foreground)]">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 text-[var(--color-foreground)]">
                    {item.description}
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-[var(--color-foreground)]">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--color-border)]">
                <td
                  colSpan={2}
                  className="py-3 px-2 text-right font-semibold text-[var(--color-foreground)]"
                >
                  Toplam
                </td>
                <td className="py-3 px-2 text-right font-bold text-[var(--color-primary)]">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
