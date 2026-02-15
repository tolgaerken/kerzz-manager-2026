import { AlertTriangle } from "lucide-react";
import { Modal } from "../../../../components/ui";
import type { Customer } from "../../types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  customer,
  onConfirm,
  isLoading = false
}: DeleteConfirmModalProps) {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Müşteri Sil" size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 mb-4 rounded-full bg-red-100">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        <p className="text-[var(--color-foreground)] mb-2">
          Bu müşteriyi silmek istediğinize emin misiniz?
        </p>

        <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
          <strong>{customer.brand || customer.name}</strong> ({customer.taxNo})
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
