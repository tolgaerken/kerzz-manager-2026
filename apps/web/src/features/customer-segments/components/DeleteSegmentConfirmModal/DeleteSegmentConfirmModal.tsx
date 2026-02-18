import { AlertTriangle } from "lucide-react";
import { Modal } from "../../../../components/ui";
import type { CustomerSegment } from "../../types";

interface DeleteSegmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: CustomerSegment | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteSegmentConfirmModal({
  isOpen,
  onClose,
  segment,
  onConfirm,
  isLoading = false
}: DeleteSegmentConfirmModalProps) {
  if (!segment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Segment Sil" size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 mb-4 rounded-full bg-[var(--color-error)]/10">
          <AlertTriangle className="w-6 h-6 text-[var(--color-error)]" />
        </div>

        <p className="text-[var(--color-foreground)] mb-2">
          Bu segmenti silmek istediğinize emin misiniz?
        </p>

        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          <strong>{segment.name}</strong>
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
            className="flex-1 px-4 py-2 text-sm font-medium text-[var(--color-error-foreground)] bg-[var(--color-error)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
