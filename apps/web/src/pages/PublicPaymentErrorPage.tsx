import { useParams, Link } from "@tanstack/react-router";
import { usePaymentInfo } from "../features/payments";

export function PublicPaymentErrorPage() {
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

  const errorMessage =
    error?.message ?? paymentInfo?.statusMessage ?? "Ödemeniz tamamlanamadı. Lütfen tekrar deneyin.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
      <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Ödeme başarısız
        </h1>
        <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
          {errorMessage}
        </p>
        <Link
          to="/odeme/$linkId"
          params={{ linkId: paymentInfo?.linkId ?? id ?? "" }}
          search={{ reset: "1" }}
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Tekrar dene
        </Link>
      </div>
    </div>
  );
}
