import { useState } from "react";
import { Modal } from "../../../../components/ui/Modal";
import { CheckCircle, XCircle, User, Calendar } from "lucide-react";
import type { Sale } from "../../types/sale.types";
import { SALES_CONSTANTS } from "../../constants/sales.constants";

type ActionMode = "approve" | "reject";

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
  isLoading?: boolean;
}

/**
 * Satış onay/red işlemi dialog'u.
 * Yetkili kullanıcının satış detaylarını görüp onay/red yapmasını sağlar.
 */
export function ApprovalActionDialog({
  open,
  onOpenChange,
  sale,
  onApprove,
  onReject,
  isLoading,
}: ApprovalActionDialogProps) {
  const [mode, setMode] = useState<ActionMode>("approve");
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  if (!sale) return null;

  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(sale.grandTotal || 0);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = () => {
    onApprove(note.trim() || undefined);
    resetForm();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason.trim());
    resetForm();
  };

  const resetForm = () => {
    setNote("");
    setRejectReason("");
    setMode("approve");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const statusConfig =
    SALES_CONSTANTS.APPROVAL_STATUS_CONFIG[sale.approvalStatus || "none"];

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Satış Onay İnceleme"
      size="md"
    >
      <div className="space-y-4">
        {/* Satış bilgileri */}
        <div className="rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-surface-elevated)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Satış No
            </span>
            <span className="font-mono font-semibold">{sale.no}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Müşteri
            </span>
            <span className="font-medium">{sale.customerName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Tutar
            </span>
            <span className="font-semibold text-[var(--color-primary)]">
              {formattedAmount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted-foreground)]">
              Onay Durumu
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig?.className || ""}`}
            >
              {statusConfig?.label || "-"}
            </span>
          </div>
        </div>

        {/* İstek sahibi bilgisi */}
        {sale.approvalRequestedByName && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/30">
            <User className="h-5 w-5 text-[var(--color-info)] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">
                İstek Sahibi: {sale.approvalRequestedByName}
              </p>
              <p className="text-[var(--color-muted-foreground)] flex items-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(sale.approvalRequestedAt)}
              </p>
              {sale.approvalNote && (
                <p className="mt-2 text-[var(--color-muted-foreground)] italic">
                  "{sale.approvalNote}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Aksiyon seçimi */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("approve")}
            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
              mode === "approve"
                ? "bg-[var(--color-success)] text-[var(--color-success-foreground)]"
                : "border border-[var(--color-border)] text-[var(--color-foreground)] opacity-60 hover:opacity-100"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Onayla
          </button>
          <button
            onClick={() => setMode("reject")}
            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
              mode === "reject"
                ? "bg-[var(--color-error)] text-[var(--color-error-foreground)]"
                : "border border-[var(--color-border)] text-[var(--color-foreground)] opacity-60 hover:opacity-100"
            }`}
          >
            <XCircle className="h-4 w-4" />
            Reddet
          </button>
        </div>

        {/* Onay notu veya red nedeni */}
        {mode === "approve" ? (
          <div className="space-y-2">
            <label
              htmlFor="approve-note"
              className="text-sm font-medium text-[var(--color-foreground)]"
            >
              Onay Notu (isteğe bağlı)
            </label>
            <textarea
              id="approve-note"
              placeholder="Onay için not ekleyin..."
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="reject-reason"
              className="text-sm font-medium text-[var(--color-error)]"
            >
              Red Nedeni (zorunlu)
            </label>
            <textarea
              id="reject-reason"
              placeholder="Red nedenini belirtin..."
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setRejectReason(e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-[var(--color-error)]/50 bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]/50"
            />
          </div>
        )}

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-md border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 transition-colors"
          >
            İptal
          </button>
          {mode === "approve" ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                "Onaylanıyor..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Onayla
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleReject}
              disabled={isLoading || !rejectReason.trim()}
              className="px-4 py-2 rounded-md bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                "Reddediliyor..."
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Reddet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
