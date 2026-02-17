import { useState } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { Send, AlertCircle } from "lucide-react";
import type { Sale } from "../../types/sale.types";

interface ApprovalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSales: Sale[];
  onSubmit: (note?: string) => void;
  isLoading?: boolean;
}

/**
 * Satış onay isteği gönderme dialog'u.
 * Seçili satışları gösterir ve isteğe bağlı not eklemeye izin verir.
 */
export function ApprovalRequestDialog({
  open,
  onOpenChange,
  selectedSales,
  onSubmit,
  isLoading,
}: ApprovalRequestDialogProps) {
  const [note, setNote] = useState("");

  const totalAmount = selectedSales.reduce(
    (sum, sale) => sum + (sale.grandTotal || 0),
    0
  );

  const formattedTotal = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(totalAmount);

  const handleSubmit = () => {
    onSubmit(note.trim() || undefined);
    setNote("");
  };

  const handleClose = () => {
    setNote("");
    onOpenChange(false);
  };

  // Onaya uygun olmayan satışları filtrele
  const ineligibleSales = selectedSales.filter(
    (s) => s.approvalStatus === "pending" || s.approvalStatus === "approved"
  );
  const eligibleSales = selectedSales.filter(
    (s) => s.approvalStatus === "none" || s.approvalStatus === "rejected"
  );

  return (
    <Modal isOpen={open} onClose={handleClose} title="Onaya Gönder" size="md">
      <div className="space-y-4">
        {/* Seçili satış özeti */}
        <div className="rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-surface-elevated)]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[var(--color-muted-foreground)]">
                Seçili Satış
              </span>
              <p className="font-semibold text-lg">{selectedSales.length}</p>
            </div>
            <div>
              <span className="text-[var(--color-muted-foreground)]">
                Toplam Tutar
              </span>
              <p className="font-semibold text-lg text-[var(--color-primary)]">
                {formattedTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Uyarı: Bazı satışlar onaya uygun değil */}
        {ineligibleSales.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
            <AlertCircle className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-[var(--color-warning)]">
                {ineligibleSales.length} satış onaya gönderilemez
              </p>
              <p className="text-[var(--color-muted-foreground)] mt-1">
                Zaten onay bekleyen veya onaylanmış satışlar atlanacak.
              </p>
            </div>
          </div>
        )}

        {/* Satış listesi */}
        <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-elevated)] sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium">No</th>
                <th className="px-3 py-2 text-left font-medium">Müşteri</th>
                <th className="px-3 py-2 text-right font-medium">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {selectedSales.map((sale) => (
                <tr
                  key={sale._id}
                  className={
                    ineligibleSales.includes(sale)
                      ? "opacity-50 line-through"
                      : ""
                  }
                >
                  <td className="px-3 py-2 font-mono">{sale.no}</td>
                  <td className="px-3 py-2 truncate max-w-[200px]">
                    {sale.customerName}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(sale.grandTotal || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Not alanı */}
        <div className="space-y-2">
          <label
            htmlFor="approval-note"
            className="text-sm font-medium text-[var(--color-foreground)]"
          >
            Not (isteğe bağlı)
          </label>
          <textarea
            id="approval-note"
            placeholder="Onay isteği için not ekleyin..."
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNote(e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
          />
        </div>

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || eligibleSales.length === 0}
            className="px-4 py-2 rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              "Gönderiliyor..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                {eligibleSales.length} Satışı Onaya Gönder
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
