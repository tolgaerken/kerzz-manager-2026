import { useParams } from "@tanstack/react-router";
import { usePaymentInfo } from "../features/payments";

export function PublicPaymentOkPage() {
  const params = useParams({ strict: false });
  const id = params?.id ?? null;
  const { data: paymentInfo, isLoading, error } = usePaymentInfo(id ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-foreground-muted)]">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            Bilgi alınamadı
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            {error?.message ?? "Ödeme bilgisi yüklenemedi."}
          </p>
        </div>
      </div>
    );
  }

  const amountStr = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(paymentInfo.paymentAmount);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
      <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--color-success)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Ödeme başarılı
        </h1>
        <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
          Ödemeniz alınmıştır.
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-[var(--color-foreground)]">
            <span className="text-[var(--color-foreground-muted)]">Tutar: </span>
            <strong>{amountStr}</strong>
          </p>
          <p className="text-[var(--color-foreground-muted)] font-mono text-xs">
            İşlem no: {paymentInfo.id}
          </p>
        </div>
      </div>
    </div>
  );
}
