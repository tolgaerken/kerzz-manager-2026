import { AlertTriangle } from "lucide-react";
import { Modal } from "../../../../components/ui";
import type { Contract } from "../../types";

interface DeleteContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contract: Contract;
  isLoading?: boolean;
}

export function DeleteContractModal({
  isOpen,
  onClose,
  onConfirm,
  contract,
  isLoading = false
}: DeleteContractModalProps) {
  const contractLabel =
    contract.brand || contract.company || `#${contract.no}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kontrat Silme Onayı" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />
          </div>
          <div className="space-y-1">
            <p className="text-[var(--color-foreground)] font-medium">
              {contractLabel}
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Bu kontrat ve kontrata ait tüm ödeme planları kalıcı olarak
              silinecektir. Bu işlem geri alınamaz.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[var(--color-error-foreground)] bg-[var(--color-error)] rounded-md hover:bg-[var(--color-error)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
