import type { ICellRendererParams } from "ag-grid-community";
import type { PaymentLinkItem } from "../../types/payment.types";

interface PaymentLinkGridContext {
  onCopyLink?: (item: PaymentLinkItem) => void;
  onResendNotify?: (item: PaymentLinkItem) => void;
}

export function PaymentLinkActionsCell(
  params: ICellRendererParams<PaymentLinkItem> & { context?: PaymentLinkGridContext }
) {
  const data = params.data;
  const ctx = params.context as PaymentLinkGridContext | undefined;
  if (!data) return null;
  const onCopyLink = ctx?.onCopyLink;
  const onResendNotify = ctx?.onResendNotify;
  if (!onCopyLink && !onResendNotify) return null;

  return (
    <div className="flex items-center gap-1 h-full">
      {onCopyLink && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyLink(data);
          }}
          className="px-2 py-1 text-xs font-medium rounded bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-foreground)]"
        >
          Link Kopyala
        </button>
      )}
      {onResendNotify && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onResendNotify(data);
          }}
          className="px-2 py-1 text-xs font-medium rounded bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] text-[var(--color-foreground)]"
        >
          Bildirim Gönder
        </button>
      )}
    </div>
  );
}
