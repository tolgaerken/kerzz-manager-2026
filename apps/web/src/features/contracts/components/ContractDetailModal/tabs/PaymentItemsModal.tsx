import { X } from "lucide-react";
import type { PaymentListItem } from "../../../types";

interface PaymentItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PaymentListItem[];
  payDate: string;
}

const formatCurrency = (value: number) => {
  if (value == null || value === 0) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(value);
};

const formatPeriod = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric"
  });
};

export function PaymentItemsModal({
  isOpen,
  onClose,
  items,
  payDate
}: PaymentItemsModalProps) {
  if (!isOpen) return null;

  const totalTL = items.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      <div className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-10 bg-[var(--color-surface)] rounded-lg shadow-xl flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[var(--color-border)] shrink-0">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
            Ürün Listesi — {formatPeriod(payDate)}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--color-muted-foreground)]">
              Bu döneme ait ürün bulunamadı.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 pr-2 font-medium text-[var(--color-muted-foreground)]">
                    Açıklama
                  </th>
                  <th className="text-right py-2 font-medium text-[var(--color-muted-foreground)]">
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <td className="py-2 pr-2 text-[var(--color-foreground)]">
                      {item.description || "-"}
                    </td>
                    <td className="py-2 text-right text-[var(--color-foreground)] tabular-nums">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex items-center justify-between px-4 md:px-5 py-3 border-t border-[var(--color-border)] shrink-0">
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {items.length} kalem
            </span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">
              Toplam: {formatCurrency(totalTL)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
