import { AlertTriangle, X, FileText, Building } from "lucide-react";
import { getConditionLabel } from "../../utils";

export interface DuplicateItem {
  type: "invoice" | "contract";
  id: string;
  label: string;
  currentCondition: string;
}

interface DuplicateSendWarningModalProps {
  isOpen: boolean;
  duplicates: DuplicateItem[];
  totalSelected: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DuplicateSendWarningModal({
  isOpen,
  duplicates,
  totalSelected,
  onConfirm,
  onCancel,
}: DuplicateSendWarningModalProps) {
  if (!isOpen) return null;

  const invoiceDuplicates = duplicates.filter((d) => d.type === "invoice");
  const contractDuplicates = duplicates.filter((d) => d.type === "contract");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-warning)]/10">
          <AlertTriangle className="w-5 h-5 text-[var(--color-warning)] shrink-0" />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              Tekrar Gönderim Uyarısı
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {duplicates.length} / {totalSelected} kayıt için bu koşulda daha önce bildirim gönderilmiş
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {invoiceDuplicates.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[var(--color-foreground)]">
                <FileText className="w-4 h-4" />
                Faturalar ({invoiceDuplicates.length})
              </div>
              <div className="space-y-1.5">
                {invoiceDuplicates.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-sm"
                  >
                    <span className="font-mono text-[var(--color-foreground)]">
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--color-warning)]">
                      {getConditionLabel(item.currentCondition)}
                    </span>
                  </div>
                ))}
                {invoiceDuplicates.length > 10 && (
                  <p className="text-xs text-[var(--color-muted-foreground)] pl-3">
                    ... ve {invoiceDuplicates.length - 10} fatura daha
                  </p>
                )}
              </div>
            </div>
          )}

          {contractDuplicates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[var(--color-foreground)]">
                <Building className="w-4 h-4" />
                Kontratlar ({contractDuplicates.length})
              </div>
              <div className="space-y-1.5">
                {contractDuplicates.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 bg-[var(--color-surface-elevated)] rounded-md text-sm"
                  >
                    <span className="text-[var(--color-foreground)]">
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--color-warning)]">
                      {getConditionLabel(item.currentCondition)}
                    </span>
                  </div>
                ))}
                {contractDuplicates.length > 10 && (
                  <p className="text-xs text-[var(--color-muted-foreground)] pl-3">
                    ... ve {contractDuplicates.length - 10} kontrat daha
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-md">
            <p className="text-sm text-[var(--color-foreground)]">
              Bu kayıtlar için aynı koşulda tekrar bildirim göndermek istiyor musunuz?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-[var(--color-warning-foreground)] bg-[var(--color-warning)] rounded-md hover:opacity-90 transition-colors"
          >
            Yine de Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
